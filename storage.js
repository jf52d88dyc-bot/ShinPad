function getFromStorage(key, fallback = []) {
    const saved = localStorage.getItem(key);

    if (!saved) {
        return fallback;
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        console.log("Storage parse error:", key, error);
        return fallback;
    }
}

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFavoriteTeams() {
    return getFromStorage("shinpad_favorite_teams", []);
}

function saveFavoriteTeams(teams) {
    saveToStorage("shinpad_favorite_teams", teams);
}

function getFavoritePlayers() {
    return getFromStorage("shinpad_favorite_players", []);
}

function saveFavoritePlayers(players) {
    saveToStorage("shinpad_favorite_players", players);
}

function getSettings() {
    return getFromStorage("shinpad_settings", {});
}

function saveSettingsData(settings) {
    saveToStorage("shinpad_settings", settings);
}

function getSavedUsername() {
    return localStorage.getItem("shinpad_username") || "";
}

function saveUsername(username) {
    localStorage.setItem("shinpad_username", username);
}
function getMatchComments(matchId) {
    return getFromStorage(`shinpad_match_thread_${matchId}`, []);
}

function saveMatchComments(matchId, comments) {
    saveToStorage(`shinpad_match_thread_${matchId}`, comments);
}

function getClubPosts(teamId) {
    return getFromStorage(`shinpad_club_thread_${teamId}`, []);
}

function saveClubPosts(teamId, posts) {
    saveToStorage(`shinpad_club_thread_${teamId}`, posts);
}

function getPlayerPosts(playerId) {
    return getFromStorage(`shinpad_player_thread_${playerId}`, []);
}

function savePlayerPosts(playerId, posts) {
    saveToStorage(`shinpad_player_thread_${playerId}`, posts);
}