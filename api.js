async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

function getAllMatches() {
    return fetchJson("/api/matches");
}

function getHomeMatches() {
    return fetchJson("/api/home-matches");
}

function getTeam(teamId) {
    return fetchJson(`/api/team/${teamId}`);
}

function getTeamMatches(teamId) {
    return fetchJson(`/api/team/${teamId}/matches`);
}

function getTeamSquad(teamId) {
    return fetchJson(`/api/team/${teamId}/squad`);
}

function getNews(query = "") {
    if (!query) {
        return fetchJson("/api/news");
    }

    return fetchJson(`/api/news?q=${encodeURIComponent(query)}`);
}

function searchShinPad(query) {
    return fetchJson(`/api/search?q=${encodeURIComponent(query)}`);
}

function getStandings(league = "PD") {
    return fetchJson(`/api/standings?league=${encodeURIComponent(league)}`);
}