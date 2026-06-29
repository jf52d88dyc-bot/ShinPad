const favoriteTeamsBox = document.getElementById("favoriteTeams");
const favoritePlayersBox = document.getElementById("favoritePlayers");
const clubCount = document.getElementById("clubCount");
const playerCount = document.getElementById("playerCount");

function getFavoriteTeams() {
    const saved = localStorage.getItem("shinpad_favorite_teams");
    return saved ? JSON.parse(saved) : [];
}

function getFavoritePlayers() {
    const saved = localStorage.getItem("shinpad_favorite_players");
    return saved ? JSON.parse(saved) : [];
}

function saveFavoriteTeams(teams) {
    localStorage.setItem("shinpad_favorite_teams", JSON.stringify(teams));
}

function saveFavoritePlayers(players) {
    localStorage.setItem("shinpad_favorite_players", JSON.stringify(players));
}

function updateCounts() {
    const teams = getFavoriteTeams();
    const players = getFavoritePlayers();

    if (clubCount) {
        clubCount.textContent = teams.length === 1 ? "1 club" : `${teams.length} clubs`;
    }

    if (playerCount) {
        playerCount.textContent = players.length === 1 ? "1 player" : `${players.length} players`;
    }
}

function removeFavoriteTeam(id) {
    const teams = getFavoriteTeams().filter(team => String(team.id) !== String(id));
    saveFavoriteTeams(teams);
    renderFollowingPage();
}

function removeFavoritePlayer(id) {
    const players = getFavoritePlayers().filter(player => String(player.id) !== String(id));
    saveFavoritePlayers(players);
    renderFollowingPage();
}

function renderFavoriteTeams() {
    if (!favoriteTeamsBox) return;

    const teams = getFavoriteTeams();

    if (teams.length === 0) {
        favoriteTeamsBox.innerHTML = `
            <div class="empty-following">
                <h3>No clubs followed yet</h3>
                <p>Follow clubs from their club profiles to build your personal ShinPad feed.</p>
                <a href="stillinger.html">Find clubs</a>
            </div>
        `;
        return;
    }

    favoriteTeamsBox.innerHTML = teams.map(team => `
        <div class="following-card-wrapper">
            <a class="following-card" href="team.html?id=${team.id}">
                <div class="following-logo-box">
                    ${team.crest ? `<img src="${team.crest}" alt="${team.name}">` : `<span>S</span>`}
                </div>

                <div>
                    <strong>${team.name}</strong>
                    <p>Club profile</p>
                </div>
            </a>

            <button class="remove-following-button" onclick="removeFavoriteTeam('${team.id}')">
                Remove
            </button>
        </div>
    `).join("");
}

function renderFavoritePlayers() {
    if (!favoritePlayersBox) return;

    const players = getFavoritePlayers();

    if (players.length === 0) {
        favoritePlayersBox.innerHTML = `
            <div class="empty-following">
                <h3>No players followed yet</h3>
                <p>Follow players from their player profiles to track them here.</p>
                <a href="player.html?id=yamal">Find players</a>
            </div>
        `;
        return;
    }

    favoritePlayersBox.innerHTML = players.map(player => `
        <div class="following-card-wrapper">
            <a class="following-card" href="player.html?id=${player.id}">
                <div class="following-player-image">
                    ${player.image ? `<img src="${player.image}" alt="${player.name}">` : `<span>👤</span>`}
                </div>

                <div>
                    <strong>${player.name}</strong>
                    <p>${player.club || "Player profile"}</p>
                </div>
            </a>

            <button class="remove-following-button" onclick="removeFavoritePlayer('${player.id}')">
                Remove
            </button>
        </div>
    `).join("");
}

function renderFollowingPage() {
    renderFavoriteTeams();
    renderFavoritePlayers();
    updateCounts();
}

renderFollowingPage();