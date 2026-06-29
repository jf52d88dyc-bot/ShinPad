fetch("/api/matches")
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById("live-kampe");
        container.innerHTML = "";

        if (!data.matches || data.matches.length === 0) {
            container.innerHTML = "<p class='loading'>Ingen kampe fundet lige nu.</p>";
            return;
        }

        data.matches.forEach(match => {
            const hjemmehold = match.homeTeam.name;
            const udehold = match.awayTeam.name;

            const hjemmeScore = match.score.fullTime.home ?? "-";
            const udeScore = match.score.fullTime.away ?? "-";

            const dato = new Date(match.utcDate).toLocaleString("da-DK");

            let status = match.status;

            if (status === "FINISHED") {
                status = "Færdig";
            } else if (status === "IN_PLAY") {
                status = "Live";
            } else if (status === "PAUSED") {
                status = "Pause";
            } else if (status === "TIMED" || status === "SCHEDULED") {
                status = "Ikke startet";
            }

            const kampKort = document.createElement("a");
            kampKort.className = "kampkort kamp-link";
            kampKort.href = `match.html?id=${match.id}`;
            kampKort.innerHTML = `
            <div class="match-header">
                <span>${hjemmehold}</span>
                <strong>${hjemmeScore} - ${udeScore}</strong>
                <span>${udehold}</span>
            </div>

            <p>📅 ${dato}</p>
            <p>🏆 ${match.competition.name}</p>
            <p class="status-badge">${status}</p>
        `;

            container.appendChild(kampKort);
        });
    })
    .catch(error => {
        const container = document.getElementById("live-kampe");
        container.innerHTML = "<p class='loading'>Kunne ikke hente kampe lige nu.</p>";
        console.log("Fejl:", error);
    });