const notificationButton = document.querySelector(".notification-button");

if (notificationButton) {
    const panel = document.createElement("div");
    panel.className = "notification-panel";

    panel.innerHTML = `
        <div class="notification-header">
            Notifications
        </div>

        <div class="notification-item">
            <strong>⚽ Barcelona scored</strong>
            <span>2 min ago</span>
        </div>

        <div class="notification-item">
            <strong>🔥 Arsenal transfer update</strong>
            <span>12 min ago</span>
        </div>

        <div class="notification-item">
            <strong>💬 New comment on your thread</strong>
            <span>25 min ago</span>
        </div>

        <div class="notification-item">
            <strong>⭐ Messi received MOTM</strong>
            <span>1 hour ago</span>
        </div>
    `;

    notificationButton.appendChild(panel);

    notificationButton.addEventListener("click", (event) => {
        event.stopPropagation();
        panel.classList.toggle("show");
    });

    panel.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    document.addEventListener("click", () => {
        panel.classList.remove("show");
    });
}