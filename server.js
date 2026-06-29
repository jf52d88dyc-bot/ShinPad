const express = require("express");

const app = express();
const PORT = 3000;

const API_TOKEN = "302fefab2dd6465b99ffb1f503137287";
const LEAGUES = ["PD", "PL", "BL1", "SA", "FL1"];

const PLAYERS = [
    { type: "player", id: "yamal", name: "Lamine Yamal", club: "FC Barcelona", country: "Spain", position: "Right Winger" },
    { type: "player", id: "pedri", name: "Pedri", club: "FC Barcelona", country: "Spain", position: "Central Midfielder" },
    { type: "player", id: "gavi", name: "Gavi", club: "FC Barcelona", country: "Spain", position: "Central Midfielder" },
    { type: "player", id: "lewandowski", name: "Robert Lewandowski", club: "FC Barcelona", country: "Poland", position: "Striker" },
    { type: "player", id: "raphinha", name: "Raphinha", club: "FC Barcelona", country: "Brazil", position: "Right Winger" },
    { type: "player", id: "messi", name: "Lionel Messi", club: "Inter Miami", country: "Argentina", position: "Forward" },
    { type: "player", id: "mbappe", name: "Kylian Mbappé", club: "Real Madrid", country: "France", position: "Forward" }
];

const FALLBACK_SQUADS = {
    81: [
        { id: "yamal", name: "Lamine Yamal", position: "Right Winger", nationality: "Spain" },
        { id: "pedri", name: "Pedri", position: "Central Midfielder", nationality: "Spain" },
        { id: "gavi", name: "Gavi", position: "Central Midfielder", nationality: "Spain" },
        { id: "lewandowski", name: "Robert Lewandowski", position: "Striker", nationality: "Poland" },
        { id: "raphinha", name: "Raphinha", position: "Right Winger", nationality: "Brazil" }
    ]
};

const NEWS = [
    {
        id: 1,
        category: "Breaking",
        title: "Arsenal jagter ny angriber",
        text: "Klubben arbejder på at hente en stor offensiv profil inden vinduet lukker.",
        trust: 78,
        comments: 184,
        tags: ["Arsenal", "Transfer", "Premier League"],
        time: "12 min ago"
    },
    {
        id: 2,
        category: "Transfer",
        title: "Real Madrid følger ungt talent",
        text: "Flere medier melder, at Real Madrid holder øje med en ny europæisk profil.",
        trust: 92,
        comments: 231,
        tags: ["Real Madrid", "Transfer", "La Liga"],
        time: "28 min ago"
    },
    {
        id: 3,
        category: "Rumour",
        title: "Chelsea forventes aktive",
        text: "Chelsea kan blive en af de mest aktive klubber i transfervinduet.",
        trust: 61,
        comments: 97,
        tags: ["Chelsea", "Rumour", "Premier League"],
        time: "1 hour ago"
    },
    {
        id: 4,
        category: "Official",
        title: "Dortmund scoutede ung profil",
        text: "Borussia Dortmund fortsætter strategien med at finde unge talenter tidligt.",
        trust: 100,
        comments: 66,
        tags: ["Dortmund", "Official", "Bundesliga"],
        time: "2 hours ago"
    },
    {
        id: 5,
        category: "Club",
        title: "Barcelona holder øje med midtbanemarkedet",
        text: "Barcelona forventes at undersøge flere muligheder på midtbanen frem mod næste vindue.",
        trust: 74,
        comments: 142,
        tags: ["Barcelona", "FC Barcelona", "La Liga", "Pedri", "Yamal"],
        time: "3 hours ago"
    },
    {
        id: 6,
        category: "Player",
        title: "Yamal fortsætter med at imponere",
        text: "Lamine Yamal bliver igen nævnt som en af Europas mest spændende unge spillere.",
        trust: 89,
        comments: 310,
        tags: ["Yamal", "Lamine Yamal", "Barcelona", "FC Barcelona"],
        time: "4 hours ago"
    }
];

app.use(express.static("."));

app.get("/kampe", (req, res) => {
    res.sendFile(__dirname + "/kampe.html");
});

app.get("/api/news", (req, res) => {
    const query = (req.query.q || "").toLowerCase().trim();

    if (!query) {
        return res.json(NEWS);
    }

    const filtered = NEWS.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.text.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
    );

    res.json(filtered);
});

app.get("/api/matches", async (req, res) => {
    try {
        const response = await fetch("https://api.football-data.org/v4/matches", {
            headers: { "X-Auth-Token": API_TOKEN }
        });

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Kunne ikke hente kampe" });
    }
});

app.get("/api/home-matches", async (req, res) => {
    try {
        let allMatches = [];

        for (const league of LEAGUES) {
            const response = await fetch(
                `https://api.football-data.org/v4/competitions/${league}/matches?status=SCHEDULED`,
                {
                    headers: { "X-Auth-Token": API_TOKEN }
                }
            );

            const data = await response.json();

            if (data.matches) {
                allMatches.push(...data.matches);
            }
        }

        allMatches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

        const liveResponse = await fetch("https://api.football-data.org/v4/matches", {
            headers: { "X-Auth-Token": API_TOKEN }
        });

        const liveData = await liveResponse.json();

        const liveMatches = (liveData.matches || []).filter(match =>
            match.status === "IN_PLAY" || match.status === "PAUSED"
        );

        res.json({
            live: liveMatches,
            upcoming: allMatches.slice(0, 12)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Kunne ikke hente forsidekampe" });
    }
});

app.get("/api/standings", async (req, res) => {
    const league = req.query.league || "PD";

    try {
        const response = await fetch(
            `https://api.football-data.org/v4/competitions/${league}/standings`,
            {
                headers: { "X-Auth-Token": API_TOKEN }
            }
        );

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Kunne ikke hente stillinger" });
    }
});

app.get("/api/search", async (req, res) => {
    const query = (req.query.q || "").toLowerCase().trim();

    if (!query) {
        return res.json([]);
    }

    try {
        let results = [];

        const matchingPlayers = PLAYERS.filter(player =>
            player.name.toLowerCase().includes(query) ||
            player.club.toLowerCase().includes(query) ||
            player.country.toLowerCase().includes(query) ||
            player.position.toLowerCase().includes(query)
        );

        results.push(...matchingPlayers);

        for (const league of LEAGUES) {
            const response = await fetch(
                `https://api.football-data.org/v4/competitions/${league}/standings`,
                {
                    headers: { "X-Auth-Token": API_TOKEN }
                }
            );

            const data = await response.json();

            if (!data.standings || !data.standings[0]) continue;

            const teams = data.standings[0].table.map(row => ({
                type: "team",
                id: row.team.id,
                name: row.team.name,
                shortName: row.team.shortName,
                crest: row.team.crest,
                league: data.competition.name,
                country: data.area.name,
                position: row.position,
                points: row.points
            }));

            const matchingTeams = teams.filter(item =>
                item.name.toLowerCase().includes(query) ||
                (item.shortName && item.shortName.toLowerCase().includes(query)) ||
                item.league.toLowerCase().includes(query)
            );

            results.push(...matchingTeams);
        }

        res.json(results.slice(0, 10));

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Kunne ikke søge" });
    }
});

app.get("/api/team/:id", async (req, res) => {
    const teamId = Number(req.params.id);

    try {
        let standingsData = null;
        let teamRow = null;

        for (const league of LEAGUES) {
            const standingsResponse = await fetch(
                `https://api.football-data.org/v4/competitions/${league}/standings`,
                {
                    headers: { "X-Auth-Token": API_TOKEN }
                }
            );

            const data = await standingsResponse.json();

            if (data.standings && data.standings[0]) {
                const foundTeam = data.standings[0].table.find(row => row.team.id === teamId);

                if (foundTeam) {
                    standingsData = data;
                    teamRow = foundTeam;
                    break;
                }
            }
        }

        const teamResponse = await fetch(
            `https://api.football-data.org/v4/teams/${teamId}`,
            {
                headers: { "X-Auth-Token": API_TOKEN }
            }
        );

        const teamData = await teamResponse.json();

        if (!teamData || !teamData.id) {
            return res.status(404).json({ error: "Holdet blev ikke fundet" });
        }

        res.json({
            id: teamData.id,
            name: teamData.name,
            shortName: teamData.shortName,
            crest: teamData.crest,
            country: teamData.area?.name || standingsData?.area?.name || "Not available",
            venue: teamData.venue || "Not available",
            coach: teamData.coach?.name || "Not available",

            league: standingsData?.competition?.name || "League not available",
            position: teamRow?.position ?? null,
            playedGames: teamRow?.playedGames ?? null,
            won: teamRow?.won ?? null,
            draw: teamRow?.draw ?? null,
            lost: teamRow?.lost ?? null,
            goalsFor: teamRow?.goalsFor ?? null,
            goalsAgainst: teamRow?.goalsAgainst ?? null,
            goalDifference: teamRow?.goalDifference ?? null,
            points: teamRow?.points ?? null
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Kunne ikke hente hold" });
    }
});

app.get("/api/team/:id/squad", async (req, res) => {
    const teamId = Number(req.params.id);

    try {
        const response = await fetch(
            `https://api.football-data.org/v4/teams/${teamId}`,
            {
                headers: { "X-Auth-Token": API_TOKEN }
            }
        );

        const data = await response.json();
        const apiSquad = data.squad || [];

        if (apiSquad.length > 0) {
            return res.json({ squad: apiSquad });
        }

        return res.json({
            squad: FALLBACK_SQUADS[teamId] || []
        });

    } catch (error) {
        console.error(error);

        return res.json({
            squad: FALLBACK_SQUADS[teamId] || []
        });
    }
});

app.get("/api/team/:id/matches", async (req, res) => {
    const teamId = Number(req.params.id);

    try {
        const response = await fetch(
            `https://api.football-data.org/v4/teams/${teamId}/matches?limit=20`,
            {
                headers: { "X-Auth-Token": API_TOKEN }
            }
        );

        const data = await response.json();

        res.json(data.matches || []);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Kunne ikke hente holdets kampe" });
    }
});

app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});