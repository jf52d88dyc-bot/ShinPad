const usernameInput = document.getElementById("settingUsername");
const bioInput = document.getElementById("settingBio");
const leagueInput = document.getElementById("settingLeague");
const feedInput = document.getElementById("settingFeed");

const notifyMatches = document.getElementById("notifyMatches");
const notifyTransfers = document.getElementById("notifyTransfers");
const notifyThreads = document.getElementById("notifyThreads");

const saveButton = document.getElementById("saveSettingsButton");
const message = document.getElementById("settingsMessage");

function loadSettings() {
    const settings = getSettings();

    usernameInput.value = settings.username || "";
    bioInput.value = settings.bio || "";

    leagueInput.value = settings.league || "all";
    feedInput.value = settings.feed || "all";

    notifyMatches.checked = settings.notifyMatches ?? true;
    notifyTransfers.checked = settings.notifyTransfers ?? true;
    notifyThreads.checked = settings.notifyThreads ?? true;
}

function saveSettings() {

    const settings = {
        username: usernameInput.value.trim(),
        bio: bioInput.value.trim(),

        league: leagueInput.value,
        feed: feedInput.value,

        notifyMatches: notifyMatches.checked,
        notifyTransfers: notifyTransfers.checked,
        notifyThreads: notifyThreads.checked
    };

    saveSettingsData(settings);

    if (settings.username) {
        saveUsername(settings.username);
    }

    message.textContent = "✅ Settings saved successfully!";

    setTimeout(() => {
        message.textContent = "";
    }, 2500);
}

saveButton.addEventListener("click", saveSettings);

loadSettings();