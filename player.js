const playerPage = document.getElementById("playerPage");

const params = new URLSearchParams(window.location.search);
const playerId = params.get("id");

const players = {
    yamal: {
        id: "yamal",
        name: "Lamine Yamal",
        club: "FC Barcelona",
        country: "Spain",
        position: "Right Winger",
        age: 18,
        height: "180 cm",
        foot: "Left",
        number: 10,
        marketValue: "€180m",
        contract: "2031",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Lamine_Yamal_2024.jpg/440px-Lamine_Yamal_2024.jpg",
        stats: {
            games: 55,
            goals: 18,
            assists: 21,
            rating: "8.1",
            minutes: 4210,
            yellowCards: 4,
            redCards: 0
        },
        form: ["W", "W", "D", "W", "L"],
        transfers: [
            "FC Barcelona U19 → FC Barcelona",
            "La Masia → FC Barcelona U19"
        ],
        news: [
            "Yamal continues to shine for Barcelona",
            "Barcelona build their attack around Yamal",
            "Spain see Yamal as a key player for the future"
        ]
    },

    messi: {
        id: "messi",
        name: "Lionel Messi",
        club: "Inter Miami",
        country: "Argentina",
        position: "Forward",
        age: 38,
        height: "170 cm",
        foot: "Left",
        number: 10,
        marketValue: "€20m",
        contract: "2025",
        image: "",
        stats: {
            games: 44,
            goals: 32,
            assists: 18,
            rating: "8.7",
            minutes: 3880,
            yellowCards: 2,
            redCards: 0
        },
        form: ["W", "D", "W", "W", "W"],
        transfers: [
            "Paris Saint-Germain → Inter Miami",
            "FC Barcelona → Paris Saint-Germain",
            "Newell's Youth → FC Barcelona"
        ],
        news: [
            "Messi remains Inter Miami's biggest star",
            "Argentina fans still follow Messi closely",
            "Messi linked with new commercial projects"
        ]
    },

    mbappe: {
        id: "mbappe",
        name: "Kylian Mbappé",
        club: "Real Madrid",
        country: "France",
        position: "Forward",
        age: 27,
        height: "178 cm",
        foot: "Right",
        number: 10,
        marketValue: "€180m",
        contract: "2029",
        image: "",
        stats: {
            games: 52,
            goals: 43,
            assists: 11,
            rating: "8.4",
            minutes: 4490,
            yellowCards: 3,
            redCards: 0
        },
        form: ["W", "W", "W", "D", "L"],
        transfers: [
            "Paris Saint-Germain → Real Madrid",
            "AS Monaco → Paris Saint-Germain",
            "AS Monaco Youth → AS Monaco"
        ],
        news: [
            "Mbappé leads Real Madrid attack",
            "France expect Mbappé to dominate the next tournament",
            "Madrid fans praise Mbappé's goalscoring form"
        ]
    }
}

function isFavoritePlayer(id) {
    return getFavoritePlayers().some(player => String(player.id) === String(id));
}

function toggleFavoritePlayer(id, name, club, image) {
    let favorites = getFavoritePlayers();

    if (isFavoritePlayer(id)) {
        favorites = favorites.filter(player => String(player.id) !== String(id));
    } else {
        favorites.push({ id, name, club, image });
    }

    saveFavoritePlayers(favorites);
    hentSpiller();
}

function renderPlayerPosts() {
    const playerPostsList = document.getElementById("playerPostsList");

    if (!playerPostsList) return;

    const posts = getPlayerPosts(playerId);

    if (posts.length === 0) {
        playerPostsList.innerHTML = `
            <p class="player-thread-empty">No player posts yet. Start the discussion.</p>
        `;
        return;
    }

    playerPostsList.innerHTML = posts.map((post, index) => {
        const profileId = normalizeUsername(post.username);

        return `
            <div class="player-post-card">
                <div class="player-post-top">
                    <div>
                        <a class="player-post-user" href="profile.html?user=${profileId}">
                            ${post.username}
                        </a>
                        <span>${post.time}</span>
                    </div>

                    <button onclick="likePlayerPost(${index})">Like ${post.likes}</button>
                </div>

                <p>${post.text}</p>
            </div>
        `;
    }).join("");
}

function likePlayerPost(index) {
    const posts = getPlayerPosts();

    if (!posts[index]) return;

    posts[index].likes += 1;
    savePlayerPosts(playerId, posts);
    renderPlayerPosts();
}

function setupPlayerThreadForm() {
    const form = document.getElementById("playerPostForm");
    const usernameInput = document.getElementById("playerPostUsername");
    const textInput = document.getElementById("playerPostText");

    if (!form) return;

    const savedUsername = getSavedUsername();

    if (savedUsername) {
        usernameInput.value = savedUsername;
    }

    usernameInput.addEventListener("input", () => {
        saveUsername(usernameInput.value.trim());
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const username = usernameInput.value.trim() || "Anonymous";
        const text = textInput.value.trim();

        if (!text) return;

        saveUsername(username);

        const posts = getPlayerPosts(playerId);

        posts.unshift({
            username,
            text,
            likes: 0,
            time: new Date().toLocaleTimeString("da-DK", {
                hour: "2-digit",
                minute: "2-digit"
            })
        });

        savePlayerPosts(playerId, posts);
        textInput.value = "";
        renderPlayerPosts();
    });

    renderPlayerPosts();
}

function lavPlayerThreadSektion(playerName) {
    const antalPosts = getPlayerPosts(playerId).length;

    return `
        <section class="player-section player-thread-section">
            <div class="player-section-title">
                <div>
                    <p class="section-kicker">Fan zone</p>
                    <h2>Threads about ${playerName}</h2>
                </div>

                <span class="player-thread-counter">
                    ${antalPosts} ${antalPosts === 1 ? "post" : "posts"}
                </span>
            </div>

            <form id="playerPostForm" class="player-post-form">
                <input id="playerPostUsername" type="text" placeholder="Username">
                <textarea id="playerPostText" placeholder="Share your take about ${playerName}..." rows="4"></textarea>
                <button type="submit">Post</button>
            </form>

            <div id="playerPostsList" class="player-posts-list"></div>
        </section>
    `;
}
function lavStatKort(title, value) {
    return `
        <div class="player-card">
            <h3>${title}</h3>
            <p>${safeValue(value)}</p>
        </div>
    `;
}

function lavForm(form) {
    return `
        <div class="player-form-row">
            ${form.map(result => `
                <span class="player-form-dot ${result === "W" ? "win" : result === "D" ? "draw" : "loss"}">
                    ${result}
                </span>
            `).join("")}
        </div>
    `;
}

function hentSpiller() {
    const player = players[playerId];

    if (!player) {
        playerPage.innerHTML = `
            <section class="player-section">
                <h2>Player not found</h2>
                <p class="loading">This player does not exist in ShinPad yet.</p>
            </section>
        `;
        return;
    }

    const favorite = isFavoritePlayer(player.id);

    playerPage.innerHTML = `
        <section class="player-hero">
            <div class="player-image-box">
                ${player.image
            ? `<img src="${player.image}" alt="${player.name}">`
            : `<div class="player-fallback">👤</div>`
        }
            </div>

            <div class="player-hero-info">
                <p class="player-country">${safeValue(player.country)}</p>
                <h1>${player.name}</h1>
                <p class="player-club">${safeValue(player.club)}</p>

                <div class="player-tags">
                    <span>${safeValue(player.position)}</span>
                    <span>#${safeValue(player.number)}</span>
                    <span>${safeValue(player.foot)} foot</span>
                    <span>${safeValue(player.marketValue)}</span>
                </div>

                <button class="follow-player-button ${favorite ? "following-player" : ""}" onclick="toggleFavoritePlayer('${player.id}', '${player.name.replaceAll("'", "\\'")}', '${player.club.replaceAll("'", "\\'")}', '${player.image}')">
                    ${favorite ? "Following player" : "Follow player"}
                </button>
            </div>
        </section>

        <section class="player-stats-grid">
            ${lavStatKort("Age", player.age)}
            ${lavStatKort("Height", player.height)}
            ${lavStatKort("Goals", player.stats.goals)}
            ${lavStatKort("Assists", player.stats.assists)}
        </section>

        <section class="player-section">
            <div class="player-section-title">
                <div>
                    <p class="section-kicker">Season overview</p>
                    <h2>Player stats</h2>
                </div>
            </div>

            <div class="player-stats-grid inside">
                ${lavStatKort("Matches", player.stats.games)}
                ${lavStatKort("Minutes", player.stats.minutes)}
                ${lavStatKort("Rating", player.stats.rating)}
                ${lavStatKort("Cards", `${player.stats.yellowCards}Y / ${player.stats.redCards}R`)}
            </div>
        </section>

        <section class="player-section">
            <div class="player-section-title">
                <div>
                    <p class="section-kicker">Last 5</p>
                    <h2>Form</h2>
                </div>
            </div>

            ${lavForm(player.form)}
        </section>

        <section class="player-grid-two">
            <section class="player-section">
                <div class="player-section-title">
                    <div>
                        <p class="section-kicker">Career path</p>
                        <h2>Transfer history</h2>
                    </div>
                </div>

                <div class="timeline">
                    ${player.transfers.map(item => `
                        <div class="timeline-item">${item}</div>
                    `).join("")}
                </div>
            </section>

            <section class="player-section">
                <div class="player-section-title">
                    <div>
                        <p class="section-kicker">Player feed</p>
                        <h2>Latest stories</h2>
                    </div>
                </div>

                <div class="player-news-list">
                    ${player.news.map(item => `
                        <div class="player-news-card">
                            <span>News</span>
                            <h3>${item}</h3>
                            <p>Personal player news will later connect to real football sources.</p>
                        </div>
                    `).join("")}
                </div>
            </section>
        </section>

        ${lavPlayerThreadSektion(player.name)}
    `;
    setupPlayerThreadForm();
}

hentSpiller();