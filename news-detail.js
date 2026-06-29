const newsPage = document.getElementById("newsPage");

const params = new URLSearchParams(window.location.search);
const newsId = Number(params.get("id"));

function normalizeUsername(username) {
    return username
        .toLowerCase()
        .trim()
        .replaceAll(" ", "-")
        .replace(/[^a-z0-9-]/g, "");
}

function getNewsThreadKey() {
    return `shinpad_news_thread_${newsId}`;
}

function hentKommentarer() {
    const saved = localStorage.getItem(getNewsThreadKey());
    return saved ? JSON.parse(saved) : [];
}

function gemKommentarer(comments) {
    localStorage.setItem(getNewsThreadKey(), JSON.stringify(comments));
}

function renderKommentarer() {
    const commentsList = document.getElementById("newsCommentsList");
    const comments = hentKommentarer();

    if (!commentsList) return;

    if (comments.length === 0) {
        commentsList.innerHTML = `<p class="loading">No comments yet. Start the discussion.</p>`;
        return;
    }

    commentsList.innerHTML = comments.map((comment, index) => {
        const profileId = normalizeUsername(comment.username);

        return `
            <div class="news-comment-card">
                <div class="news-comment-top">
                    <div>
                        <a class="news-comment-user" href="profile.html?user=${profileId}">
                            ${comment.username}
                        </a>
                        <span>${comment.time}</span>
                    </div>

                    <button onclick="likeKommentar(${index})">Like ${comment.likes}</button>
                </div>

                <p>${comment.text}</p>
            </div>
        `;
    }).join("");
}

function likeKommentar(index) {
    const comments = hentKommentarer();

    if (!comments[index]) return;

    comments[index].likes += 1;
    gemKommentarer(comments);
    renderKommentarer();
}

function setupCommentForm() {
    const form = document.getElementById("newsCommentForm");
    const usernameInput = document.getElementById("newsCommentUsername");
    const textInput = document.getElementById("newsCommentText");

    if (!form) return;

    const savedUsername = localStorage.getItem("shinpad_username");

    if (savedUsername) {
        usernameInput.value = savedUsername;
    }

    usernameInput.addEventListener("input", () => {
        localStorage.setItem("shinpad_username", usernameInput.value.trim());
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const username = usernameInput.value.trim() || "Anonymous";
        const text = textInput.value.trim();

        if (!text) return;

        localStorage.setItem("shinpad_username", username);

        const comments = hentKommentarer();

        comments.unshift({
            username,
            text,
            likes: 0,
            time: new Date().toLocaleTimeString("da-DK", {
                hour: "2-digit",
                minute: "2-digit"
            })
        });

        gemKommentarer(comments);
        textInput.value = "";
        renderKommentarer();
    });

    renderKommentarer();
}

function renderStory(story, allNews) {
    const related = allNews
        .filter(item => item.id !== story.id)
        .slice(0, 3);

    newsPage.innerHTML = `
        <section class="news-hero">
            <span class="news-category">${story.category}</span>

            <h1 class="news-title">${story.title}</h1>

            <div class="news-meta">
                <span>${story.time}</span>
                <span>Trust score ${story.trust}%</span>
                <span>${story.comments} comments</span>
            </div>
        </section>

        <article class="news-content">
            <p>${story.text}</p>

            <p>
                This story is part of ShinPad's football news system. Later this page will include
                real sources, fan reactions, related matches, player links and AI summaries.
            </p>

            <div class="news-tags">
                ${story.tags.map(tag => `<span>${tag}</span>`).join("")}
            </div>

            <div class="news-actions">
                <button class="news-action">Like</button>
                <button class="news-action" onclick="document.getElementById('newsCommentText').focus()">Comment</button>
                <button class="news-action">Save</button>
            </div>
        </article>

        <section class="news-content">
            <h2>Discussion</h2>

            <form id="newsCommentForm" class="news-comment-form">
                <input id="newsCommentUsername" type="text" placeholder="Username">
                <textarea id="newsCommentText" placeholder="Share your take..." rows="4"></textarea>
                <button type="submit">Post comment</button>
            </form>

            <div id="newsCommentsList" class="news-comments-list"></div>
        </section>

        <section class="related-news">
            <h2>Related stories</h2>

            ${related.map(item => `
                <a class="related-card" href="news.html?id=${item.id}">
                    <h3>${item.title}</h3>
                    <p>${item.category} • ${item.time}</p>
                </a>
            `).join("")}
        </section>
    `;

    setupCommentForm();
}

async function hentNewsStory() {
    try {
        const response = await fetch("/api/news");
        const allNews = await response.json();

        const story = allNews.find(item => item.id === newsId);

        if (!story) {
            newsPage.innerHTML = "<p class='loading'>Story not found.</p>";
            return;
        }

        renderStory(story, allNews);

    } catch (error) {
        console.log(error);
        newsPage.innerHTML = "<p class='loading'>Could not load story.</p>";
    }
}

hentNewsStory();