const homeMatches = document.getElementById("homeMatches");
const favoriteTeams = document.getElementById("favoriteTeams");
const homeNews = document.getElementById("homeNews");
const teamSearch = document.getElementById("teamSearch");
const searchResults = document.getElementById("searchResults");

function oversaetStatus(status) {
    if (status === "FINISHED") return "Full time";
    if (status === "IN_PLAY") return "Live";
    if (status === "PAUSED") return "Half time";
    if (status === "TIMED" || status === "SCHEDULED") return "Upcoming";
    return status || "Unknown";
}

function formatDato(dato) {
    return new Date(dato).toLocaleString("da-DK", {
        day: "2-digit",
        month: "2-digit",
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

function getTeamLink(team) {
    if (!team || !team.id) return "#";
    return `team.html?id=${team.id}`;
}

function getFavoriteTeams() {
    const saved = localStorage.getItem("shinpad_favorite_teams");
    return saved ? JSON.parse(saved) : [];
}

function renderFavoriteTeams() {
    if (!favoriteTeams) return;

    const teams = getFavoriteTeams();

    if (teams.length === 0) {
        favoriteTeams.innerHTML = `
            <div class="empty-personal-feed">
                <h3>Your football world starts here</h3>
                <p>Follow clubs to build your own ShinPad feed with matches, news and stories.</p>
                <a href="stillinger.html">Find clubs</a>
            </div>
        `;
        return;
    }

    favoriteTeams.innerHTML = teams.map(team => `
        <a class="favorite-team-card" href="team.html?id=${team.id}">
            <div class="favorite-team-logo">
                ${team.crest ? `<img src="${team.crest}" alt="${team.name}">` : `<span>S</span>`}
            </div>

            <div>
                <strong>${team.name}</strong>
                <p>News, matches and club profile</p>
            </div>
        </a>
    `).join("");
}

function renderHomeNews(news, isPersonal = false) {
    if (!homeNews) return;

    if (!news || news.length === 0) {
        homeNews.innerHTML = `<p class="loading">No news found.</p>`;
        return;
    }

    homeNews.innerHTML = `
        ${isPersonal ? `<p class="section-kicker">For you</p>` : `<p class="section-kicker">Latest stories</p>`}

        ${news.slice(0, 4).map(item => `
            <a class="home-news-card" href="news.html?id=${item.id}">
                <div class="transfer-status">${item.category || "News"}</div>
                <h3>${item.title || "Untitled story"}</h3>
                <p>${item.text || "No description available."}</p>
                <span>${item.time || "Now"} • Trust score ${item.trust || 0}% • ${item.comments || 0} comments</span>
            </a>
        `).join("")}
    `;
}

async function hentForsideNews() {
    try {
        const favoriteClubs = getFavoriteTeams().map(team => team.name.toLowerCase());

        const response = await fetch("/api/news");
        const news = await response.json();

        if (!Array.isArray(news)) {
            renderHomeNews([]);
            return;
        }

        const personalNews = news.filter(item => {
            const searchText = `
                ${item.title || ""}
                ${item.text || ""}
                ${(item.tags || []).join(" ")}
                ${item.category || ""}
            `.toLowerCase();

            return favoriteClubs.some(club => searchText.includes(club));
        });

        if (favoriteClubs.length > 0 && personalNews.length > 0) {
            renderHomeNews(personalNews, true);
        } else {
            renderHomeNews(news, false);
        }

    } catch (error) {
        console.log(error);
        homeNews.innerHTML = `<p class="loading">Could not load news.</p>`;
    }
}

function getSearchLink(result) {
    if (result.type === "player") {
        return `player.html?id=${result.id}`;
    }

    return `team.html?id=${result.id}`;
}

function getSearchSubtitle(result) {
    if (result.type === "player") {
        return `${result.position || "Player"} • ${result.club || "Unknown club"} • ${result.country || "Unknown country"}`;
    }

    return `${result.league || "Unknown league"} • ${result.country || "Unknown country"}`;
}

function getSearchIcon(result) {
    if (result.type === "player") return "Player";
    return "Club";
}

function lavKampKort(match) {
    return `
        <div class="home-match-card">
            <a class="home-match-full-link" href="match.html?id=${match.id}">
                <div class="home-match-top">
                    <span>${match.competition?.name || "Unknown competition"}</span>
                    <span class="status-badge">${oversaetStatus(match.status)}</span>
                </div>
            </a>

            <div class="home-match-main home-match-main-logo">
                <a class="home-team" href="${getTeamLink(match.homeTeam)}">
                    ${match.homeTeam?.crest ? `<img src="${match.homeTeam.crest}" alt="${match.homeTeam.name}">` : ""}
                    <span>${match.homeTeam?.name || "Home team"}</span>
                </a>

                <a class="home-score" href="match.html?id=${match.id}">
                    ${getScore(match)}
                </a>

                <a class="home-team away" href="${getTeamLink(match.awayTeam)}">
                    ${match.awayTeam?.crest ? `<img src="${match.awayTeam.crest}" alt="${match.awayTeam.name}">` : ""}
                    <span>${match.awayTeam?.name || "Away team"}</span>
                </a>
            </div>

            <p>${formatDato(match.utcDate)}</p>
        </div>
    `;
}

async function hentForsideKampe() {
    try {
        const response = await fetch("/api/home-matches");
        const data = await response.json();

        const liveMatches = data.live || [];
        const upcomingMatches = data.upcoming || [];
        const allMatches = [...liveMatches, ...upcomingMatches];

        if (allMatches.length === 0) {
            homeMatches.innerHTML = "<p class='loading'>Ingen kampe fundet lige nu.</p>";
            return;
        }

        homeMatches.innerHTML = `
            ${liveMatches.length > 0 ? `<p class="section-kicker">Live now</p>` : ""}
            ${liveMatches.slice(0, 4).map(match => lavKampKort(match)).join("")}

            ${upcomingMatches.length > 0 ? `<p class="section-kicker">Upcoming matches</p>` : ""}
            ${upcomingMatches.slice(0, 8).map(match => lavKampKort(match)).join("")}
        `;

    } catch (error) {
        console.log(error);
        homeMatches.innerHTML = "<p class='loading'>Kunne ikke hente kampe.</p>";
    }
}

let searchTimeout;

if (teamSearch && searchResults) {
    teamSearch.addEventListener("input", () => {
        clearTimeout(searchTimeout);

        const query = teamSearch.value.trim();

        if (query.length < 2) {
            searchResults.innerHTML = "";
            return;
        }

        searchTimeout = setTimeout(() => {
            hentSogeResultater(query);
        }, 300);
    });
}

async function hentSogeResultater(query) {
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();

        if (!results || results.length === 0) {
            searchResults.innerHTML = `<div class="search-empty">Ingen resultater fundet.</div>`;
            return;
        }

        searchResults.innerHTML = results.map(result => `
            <a class="search-result" href="${getSearchLink(result)}">
                <div>
                    <strong>${getSearchIcon(result)} · ${result.name}</strong>
                    <p>${getSearchSubtitle(result)}</p>
                </div>

                ${result.crest ? `<img src="${result.crest}" alt="${result.name}">` : ""}
            </a>
        `).join("");

    } catch (error) {
        console.log(error);
        searchResults.innerHTML = `<div class="search-empty">Kunne ikke søge lige nu.</div>`;
    }
}
function showHomeSkeletons() {
    if (homeMatches) {
        homeMatches.innerHTML = `
            <div class="skeleton-grid">
                <div class="skeleton skeleton-card"></div>
                <div class="skeleton skeleton-card"></div>
                <div class="skeleton skeleton-card"></div>
            </div>
        `;
    }

    if (homeNews) {
        homeNews.innerHTML = `
            <div class="skeleton skeleton-card"></div>
            <div class="skeleton skeleton-card"></div>
        `;
    }
}
renderFavoriteTeams();
hentForsideKampe();
hentForsideNews();