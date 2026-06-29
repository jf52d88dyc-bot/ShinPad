const matchPage = document.getElementById("matchPage");

const params = new URLSearchParams(window.location.search);
const matchId = Number(params.get("id"));

function oversaetStatus(status) {
    if (status === "FINISHED") return "Full time";
    if (status === "IN_PLAY") return "Live";
    if (status === "PAUSED") return "Half time";
    if (status === "TIMED" || status === "SCHEDULED") return "Upcoming";
    return status || "Unknown";
}

function formatDato(dato) {
    return new Date(dato).toLocaleString("da-DK", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getScore(match) {
    const home = match.score?.fullTime?.home;
    const away = match.score?.fullTime?.away;

    if (home === null || home === undefined || away === null || away === undefined) {
        return "vs";
    }

    return `${home} - ${away}`;
}

function safeValue(value, fallback = "Not available") {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }

    return value;
}

function normalizeUsername(username) {
    return username
        .toLowerCase()
        .trim()
        .replaceAll(" ", "-")
        .replace(/[^a-z0-9-]/g, "");
}

function getThreadKey() {
    return `shinpad_match_thread_${matchId}`;
}

function hentKommentarer() {
    const saved = localStorage.getItem(getThreadKey());
    return saved ? JSON.parse(saved) : [];
}

function gemKommentarer(comments) {
    localStorage.setItem(getThreadKey(), JSON.stringify(comments));
}

function renderKommentarer() {
    const commentsList = document.getElementById("commentsList");
    const comments = hentKommentarer();

    if (!commentsList) return;

    if (comments.length === 0) {
        commentsList.innerHTML = `
            <p class="match-placeholder">No comments yet. Start the thread.</p>
        `;
        return;
    }

    commentsList.innerHTML = comments.map((comment, index) => {
        const profileId = normalizeUsername(comment.username);

        return `
            <div class="comment-card">
                <div class="comment-top">
                    <div>
                        <a class="comment-user" href="profile.html?user=${profileId}">
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

function setupThreadForm() {
    const form = document.getElementById("commentForm");
    const usernameInput = document.getElementById("commentUsername");
    const textInput = document.getElementById("commentText");

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

async function hentKamp() {
    if (!matchId) {
        matchPage.innerHTML = "<p>Ingen kamp valgt.</p>";
        return;
    }

    try {
        const response = await fetch("/api/matches");
        const data = await response.json();

        const match = data.matches.find(kamp => kamp.id === matchId);

        if (!match) {
            matchPage.innerHTML = "<p>Kampen blev ikke fundet.</p>";
            return;
        }

        matchPage.innerHTML = `
            <section class="match-hero premium-match-hero">
                <div class="match-top-info">
                    <span>${safeValue(match.competition?.name)}</span>
                    <span>${formatDato(match.utcDate)}</span>
                    <span class="live-pill">${oversaetStatus(match.status)}</span>
                </div>

                <div class="match-teams">
                    <div class="match-team">
                        <img src="${match.homeTeam.crest || ""}" alt="${match.homeTeam.name}">
                        <h2>${match.homeTeam.name}</h2>
                        <p>Home</p>
                    </div>

                    <div class="match-score">
                        ${getScore(match)}
                    </div>

                    <div class="match-team">
                        <img src="${match.awayTeam.crest || ""}" alt="${match.awayTeam.name}">
                        <h2>${match.awayTeam.name}</h2>
                        <p>Away</p>
                    </div>
                </div>
            </section>

            <section class="match-info-grid">
                <div class="match-info-card">
                    <h3>Stadium</h3>
                    <p>${safeValue(match.venue)}</p>
                </div>

                <div class="match-info-card">
                    <h3>Referee</h3>
                    <p>${match.referees && match.referees.length > 0 ? match.referees[0].name : "Not available"}</p>
                </div>

                <div class="match-info-card">
                    <h3>Status</h3>
                    <p>${oversaetStatus(match.status)}</p>
                </div>

                <div class="match-info-card">
                    <h3>Goalscorers</h3>
                    <p class="match-placeholder">Goalscorers will appear here when available.</p>
                </div>
            </section>

            <section class="match-thread-box">
                <div>
                    <p class="section-kicker">Social layer</p>
                    <h2>Match Thread</h2>
                </div>

                <form id="commentForm" class="comment-form">
                    <input id="commentUsername" type="text" placeholder="Username">
                    <textarea id="commentText" placeholder="Share your take..." rows="4"></textarea>
                    <button type="submit">Post comment</button>
                </form>

                <div id="commentsList" class="comments-list"></div>
            </section>
        `;

        setupThreadForm();

    } catch (error) {
        console.log(error);
        matchPage.innerHTML = "<p>Kunne ikke hente kampen.</p>";
    }
}

hentKamp();