function safeValue(value, fallback = "Not available") {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }

    return value;
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

function formatKortDato(dato) {
    return new Date(dato).toLocaleString("da-DK", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatLangDato(dato) {
    return new Date(dato).toLocaleString("da-DK", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function oversaetStatus(status) {
    if (status === "FINISHED") return "Full time";
    if (status === "IN_PLAY") return "Live";
    if (status === "PAUSED") return "Half time";
    if (status === "TIMED" || status === "SCHEDULED") return "Upcoming";
    return status || "Unknown";
}

function getScore(match) {
    const home = match.score?.fullTime?.home;
    const away = match.score?.fullTime?.away;

    if (home === null || home === undefined || away === null || away === undefined) {
        return "vs";
    }

    return `${home} - ${away}`;
}

function normalizeUsername(username) {
    return username
        .toLowerCase()
        .trim()
        .replaceAll(" ", "-")
        .replace(/[^a-z0-9-]/g, "");
}