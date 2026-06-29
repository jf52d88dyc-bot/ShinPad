const teamPage = document.getElementById("teamPage");

const params = new URLSearchParams(window.location.search);
const teamId = params.get("id");

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
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getScore(match) {
    const home = match.score?.fullTime?.home;
    const away = match.score?.fullTime?.away;
    if (home === null || home === undefined || away === null || away === undefined) return "vs";
    return `${home} - ${away}`;
}

function safeValue(value, fallback = "Not available") {
    if (value === null || value === undefined || value === "") return fallback;
    return value;
}

function normalizeUsername(username) {
    return username
        .toLowerCase()
        .trim()
        .replaceAll(" ", "-")
        .replace(/[^a-z0-9-]/g, "");
}

function getFavoriteTeams() {
    const saved = localStorage.getItem("shinpad_favorite_teams");
    return saved ? JSON.parse(saved) : [];
}

function saveFavoriteTeams(teams) {
    localStorage.setItem("shinpad_favorite_teams", JSON.stringify(teams));
}

function isFavoriteTeam(id) {
    return getFavoriteTeams().some(team => String(team.id) === String(id));
}

function toggleFavoriteTeam(id, name, crest) {
    let favorites = getFavoriteTeams();

    if (isFavoriteTeam(id)) {
        favorites = favorites.filter(team => String(team.id) !== String(id));
    } else {
        favorites.push({ id, name, crest });
    }

    saveFavoriteTeams(favorites);
    hentHold();
}

function getClubThreadKey() {
    return `shinpad_club_thread_${teamId}`;
}

function hentClubPosts() {
    const saved = localStorage.getItem(getClubThreadKey());
    return saved ? JSON.parse(saved) : [];
}

function gemClubPosts(posts) {
    localStorage.setItem(getClubThreadKey(), JSON.stringify(posts));
}

function renderClubPosts() {
    const clubPostsList = document.getElementById("clubPostsList");
    if (!clubPostsList) return;

    const posts = hentClubPosts();

    if (posts.length === 0) {
        clubPostsList.innerHTML = `
            <p class="club-thread-empty">No club posts yet. Start the discussion.</p>
        `;
        return;
    }

    clubPostsList.innerHTML = posts.map((post, index) => {
        const profileId = normalizeUsername(post.username);

        return `
            <div class="club-post-card">
                <div class="club-post-top">
                    <div>
                        <a class="club-post-user" href="profile.html?user=${profileId}">
                            ${post.username}
                        </a>
                        <span>${post.time}</span>
                    </div>

                    <button onclick="likeClubPost(${index})">Like ${post.likes}</button>
                </div>

                <p>${post.text}</p>
            </div>
        `;
    }).join("");
}

function likeClubPost(index) {
    const posts = hentClubPosts();

    if (!posts[index]) return;

    posts[index].likes += 1;
    gemClubPosts(posts);
    renderClubPosts();
}

function setupClubThreadForm() {
    const form = document.getElementById("clubPostForm");
    const usernameInput = document.getElementById("clubPostUsername");
    const textInput = document.getElementById("clubPostText");

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

        const posts = hentClubPosts();

        posts.unshift({
            username,
            text,
            likes: 0,
            time: new Date().toLocaleTimeString("da-DK", {
                hour: "2-digit",
                minute: "2-digit"
            })
        });

        gemClubPosts(posts);
        textInput.value = "";
        renderClubPosts();
    });

    renderClubPosts();
}

function lavStatKort(titel, value) {
    return `
        <div class="team-stat-card">
            <h3>${titel}</h3>
            <p>${safeValue(value)}</p>
        </div>
    `;
}

function lavKampKort(match) {
    return `
        <a class="team-match-card" href="match.html?id=${match.id}">
            <div class="team-match-top">
                <span>${match.competition?.name || "Unknown competition"}</span>
                <span class="status-badge">${oversaetStatus(match.status)}</span>
            </div>

            <div class="team-match-main">
                <span>${match.homeTeam.name}</span>
                <strong>${getScore(match)}</strong>
                <span>${match.awayTeam.name}</span>
            </div>

            <p>${formatDato(match.utcDate)}</p>
        </a>
    `;
}

function lavKampSektion(titel, kampe, tomTekst) {
    return `
        <section class="team-matches-section">
            <h2>${titel}</h2>

            <div class="team-matches-list">
                ${kampe.length > 0
            ? kampe.map(match => lavKampKort(match)).join("")
            : `<p class="loading">${tomTekst}</p>`
        }
            </div>
        </section>
    `;
}

function lavForm(matches, teamId) {
    const finished = matches
        .filter(match => match.status === "FINISHED")
        .slice(0, 5);

    if (finished.length === 0) return "";

    const form = finished.map(match => {
        const isHome = match.homeTeam.id === Number(teamId);
        const ownScore = isHome ? match.score.fullTime.home : match.score.fullTime.away;
        const oppScore = isHome ? match.score.fullTime.away : match.score.fullTime.home;

        if (ownScore > oppScore) return `<span class="form-dot win">W</span>`;
        if (ownScore < oppScore) return `<span class="form-dot loss">L</span>`;
        return `<span class="form-dot draw">D</span>`;
    }).join("");

    return `
        <section class="team-matches-section">
            <h2>Form</h2>
            <div class="form-row">
                ${form}
            </div>
        </section>
    `;
}

function lavSpillerKort(player) {
    const playerId = player.id || encodeURIComponent(player.name.toLowerCase().replaceAll(" ", "-"));

    return `
        <a class="team-player-card" href="player.html?id=${playerId}">
            <div class="player-avatar">P</div>
            <div>
                <strong>${player.name}</strong>
                <p>${safeValue(player.position)} • ${safeValue(player.nationality)}</p>
            </div>
        </a>
    `;
}

function lavTrupSektion(squad) {
    return `
        <section class="team-matches-section">
            <h2>Squad</h2>

            <div class="team-squad-grid">
                ${squad.length > 0
            ? squad.map(player => lavSpillerKort(player)).join("")
            : `<p class="loading">Squad not available yet.</p>`
        }
            </div>
        </section>
    `;
}

function lavNewsSektion(news, teamName) {
    return `
        <section class="team-matches-section">
            <h2>${teamName} News</h2>

            <div class="team-news-grid">
                ${news.length > 0
            ? news.slice(0, 4).map(item => `
                        <a class="team-news-card" href="news.html?id=${item.id}">
                            <span class="transfer-status">${item.category}</span>
                            <h3>${item.title}</h3>
                            <p>${item.text}</p>
                            <small>${item.time} • Trust ${item.trust}% • ${item.comments} comments</small>
                        </a>
                    `).join("")
            : `<p class="loading">No news found for this club yet.</p>`
        }
            </div>
        </section>
    `;
}

function lavClubThreadSektion(teamName) {

    const antalPosts = hentClubPosts().length;

    return `
        <section class="team-matches-section club-thread-section">

            <div class="club-thread-title">

                <div>
                    <p class="section-kicker">Social layer</p>
                    <h2>${teamName} Thread</h2>
                </div>

                <span class="club-thread-counter">
                    ${antalPosts} ${antalPosts === 1 ? "post" : "posts"}
                </span>

            </div>

            <form id="clubPostForm" class="club-post-form">

                <input
                    id="clubPostUsername"
                    type="text"
                    placeholder="Username"
                >

                <textarea
                    id="clubPostText"
                    rows="4"
                    placeholder="Share your take about ${teamName}..."
                ></textarea>

                <button type="submit">
                    Post
                </button>

            </form>

            <div
                id="clubPostsList"
                class="club-posts-list">
            </div>

        </section>
    `;
}

async function hentHold() {
    if (!teamId) {
        teamPage.innerHTML = "<p>No team selected.</p>";
        return;
    }

    teamPage.innerHTML = "<p class='loading'>Loading team...</p>";

    try {
        const teamResponse = await fetch(`/api/team/${teamId}`);
        const team = await teamResponse.json();

        const matchesResponse = await fetch(`/api/team/${teamId}/matches`);
        const matches = await matchesResponse.json();

        const squadResponse = await fetch(`/api/team/${teamId}/squad`);
        const squadData = await squadResponse.json();
        const squad = squadData.squad || [];

        const newsResponse = await fetch(`/api/news?q=${encodeURIComponent(team.name)}`);
        let teamNews = await newsResponse.json();

        if (teamNews.length === 0 && team.shortName) {
            const shortNewsResponse = await fetch(`/api/news?q=${encodeURIComponent(team.shortName)}`);
            teamNews = await shortNewsResponse.json();
        }

        const finishedMatches = matches
            .filter(match => match.status === "FINISHED")
            .slice(0, 5);

        const upcomingMatches = matches
            .filter(match => match.status !== "FINISHED")
            .slice(0, 5);

        const favorite = isFavoriteTeam(team.id);

        teamPage.innerHTML = `
            <section class="team-hero-modern">
                <div class="team-logo-box">
                    <img src="${team.crest}" alt="${team.name}">
                </div>

                <div class="team-hero-info">
                    <p class="team-country">${safeValue(team.country)}</p>
                    <h2>${team.name}</h2>
                    <p class="team-short">${safeValue(team.shortName, "")}</p>

                    <div class="team-tags">
                        <span>${safeValue(team.league)}</span>
                        <span>${team.position ? "Position " + team.position : "Position not available"}</span>
                        <span>${team.points !== null && team.points !== undefined ? team.points + " points" : "Points not available"}</span>
                    </div>

                    <button class="follow-club-button ${favorite ? "following-club" : ""}" onclick="toggleFavoriteTeam('${team.id}', '${team.name.replaceAll("'", "\\'")}', '${team.crest}')">
                        ${favorite ? "Following club" : "Follow club"}
                    </button>
                </div>
            </section>

            ${lavNewsSektion(teamNews, team.shortName || team.name)}

            <section class="team-stats-grid">
                ${lavStatKort("Position", team.position ? "No. " + team.position : null)}
                ${lavStatKort("Points", team.points)}
                ${lavStatKort("Goals", team.goalsFor !== null ? `${team.goalsFor}-${team.goalsAgainst}` : null)}
                ${lavStatKort("Goal Difference", team.goalDifference)}
            </section>

            <section class="team-stats-grid">
                ${lavStatKort("Wins", team.won)}
                ${lavStatKort("Draws", team.draw)}
                ${lavStatKort("Losses", team.lost)}
                ${lavStatKort("Matches", team.playedGames)}
            </section>

            ${lavForm(matches, teamId)}

            ${lavClubThreadSektion(team.shortName || team.name)}

            ${lavKampSektion("Recent matches", finishedMatches, "No finished matches found.")}
            ${lavKampSektion("Upcoming matches", upcomingMatches, "No upcoming matches found.")}

            ${lavTrupSektion(squad)}
        `;

        setupClubThreadForm();

    } catch (error) {
        console.log(error);
        teamPage.innerHTML = "<p>Could not load team.</p>";
    }
}

hentHold();