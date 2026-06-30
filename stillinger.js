const leagueSelect = document.getElementById("leagueSelect");
const standingsBox = document.getElementById("standingsBox");
const standingsInfo = document.getElementById("standingsInfo");

async function hentStilling(leagueCode = "PD") {
    standingsInfo.textContent = "Indlæser stilling...";
    standingsBox.innerHTML = "";

    try {
        const data = await getStandings(leagueCode);

        if (!data.standings || !data.standings[0]) {
            standingsInfo.textContent = "Kunne ikke finde stilling.";
            return;
        }

        const table = data.standings[0].table;

        standingsInfo.textContent = `${data.competition.name} • Runde ${data.season.currentMatchday}`;

        standingsBox.innerHTML = `
            <table class="standings-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Hold</th>
                        <th>K</th>
                        <th>V</th>
                        <th>U</th>
                        <th>T</th>
                        <th>Mål</th>
                        <th>MF</th>
                        <th>P</th>
                    </tr>
                </thead>
                <tbody>
                    ${table.map(team => {
            const rowClass =
                team.position <= 4 ? "ucl" :
                    team.position === 5 ? "uel" :
                        team.position === 6 ? "conference" :
                            team.position >= 18 ? "relegation" : "";

            return `
                            <tr class="${rowClass}">
                                <td>${team.position}</td>

                                <td class="team-name">
                                    <a class="team-link" href="team.html?id=${team.team.id}">
                                        <img src="${team.team.crest}" alt="${team.team.name}">
                                        <span>${team.team.name}</span>
                                    </a>
                                </td>

                                <td>${team.playedGames}</td>
                                <td>${team.won}</td>
                                <td>${team.draw}</td>
                                <td>${team.lost}</td>
                                <td>${team.goalsFor}-${team.goalsAgainst}</td>
                                <td>${team.goalDifference}</td>
                                <td><strong>${team.points}</strong></td>
                            </tr>
                        `;
        }).join("")}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.log("Fejl:", error);
        standingsInfo.textContent = "Kunne ikke hente stilling lige nu.";
    }
}

const params = new URLSearchParams(window.location.search);

const valgtLiga = params.get("league") || "PD";

leagueSelect.value = valgtLiga;

leagueSelect.addEventListener("change", () => {
    hentStilling(leagueSelect.value);
});

hentStilling(valgtLiga);