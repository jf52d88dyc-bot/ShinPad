document.addEventListener("DOMContentLoaded", () => {

    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    const nav = document.querySelector(".main-nav");

    if (!nav) return;

    nav.innerHTML = `
        <a href="index.html" class="${currentPage === "index.html" ? "active" : ""}">
            Home
        </a>

        <a href="kampe.html" class="${currentPage === "kampe.html" ? "active" : ""}">
            Matches
        </a>

        <a href="stillinger.html" class="${currentPage === "stillinger.html" ? "active" : ""}">
            Leagues
        </a>

        <a href="transfers.html" class="${currentPage === "transfers.html" ? "active" : ""}">
            News
        </a>

        <a href="following.html" class="${currentPage === "following.html" ? "active" : ""}">
            Following
        </a>

        <a href="settings.html" class="${currentPage === "settings.html" ? "active" : ""}">
            Settings
        </a>
    `;

});