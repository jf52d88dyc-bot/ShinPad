const newsGrid = document.getElementById("newsGrid");

let allNews = [];

function cardColor(category) {
    switch (category.toLowerCase()) {
        case "breaking":
            return "breaking-card";
        case "official":
            return "official-card";
        case "transfer":
            return "herewego-card";
        case "rumour":
            return "rumour-card";
        default:
            return "";
    }
}

function renderNews(news) {
    if (news.length === 0) {
        newsGrid.innerHTML = `
            <p class="loading">No news found.</p>
        `;
        return;
    }

    newsGrid.innerHTML = news.map(item => `
        <a class="transfer-card news-link-card ${cardColor(item.category)}" href="news.html?id=${item.id}">
            <div class="transfer-status">
                ${item.category}
            </div>

            <h3>${item.title}</h3>

            <p>${item.text}</p>

            <div class="hype-bar">
                <span style="width:${item.trust}%"></span>
            </div>

            <p class="hype-text">
                Trust score ${item.trust}% •
                ${item.comments} comments •
                ${item.time}
            </p>

            <div class="news-tags">
                ${item.tags.map(tag => `<span>${tag}</span>`).join("")}
            </div>
        </a>
    `).join("");
}

async function hentNews() {
    try {
        const response = await fetch("/api/news");
        allNews = await response.json();
        renderNews(allNews);

    } catch (err) {
        console.log(err);

        newsGrid.innerHTML = `
            <p class="loading">Could not load news.</p>
        `;
    }
}

document.querySelectorAll(".filter").forEach(filter => {
    filter.addEventListener("click", () => {
        document
            .querySelectorAll(".filter")
            .forEach(f => f.classList.remove("active"));

        filter.classList.add("active");

        const text = filter.textContent.toLowerCase();

        if (text === "all" || text === "alle") {
            renderNews(allNews);
            return;
        }

        renderNews(
            allNews.filter(item =>
                item.category.toLowerCase().includes(text)
            )
        );
    });
});

hentNews();