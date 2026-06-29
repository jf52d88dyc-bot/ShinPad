const profilePage = document.getElementById("profilePage");

const params = new URLSearchParams(window.location.search);
const username = params.get("user") || "sebastian";

const profiles = {
    sebastian: {
        name: "Sebastian",
        username: "sebastian",
        avatar: "S",
        verified: true,
        rank: "#184",
        level: "Elite Analyst",
        favoriteClub: "FC Barcelona",
        bio: "ShinPad founder. Barcelona fan. Building the future home for football takes.",
        followers: 128,
        following: 42,
        likes: 934,
        comments: 76,
        reputation: 12493,
        predictionAccuracy: "91%",
        correctPredictions: 418,
        badges: ["Founder", "Barcelona Expert", "Top Commenter", "90% Predictor"],
        clubs: [
            { name: "FC Barcelona", link: "team.html?id=81" },
            { name: "Argentina", link: "#" },
            { name: "Arsenal", link: "team.html?id=57" }
        ],
        predictions: [
            { title: "Barcelona win by 2 goals", score: "96/100", status: "Correct" },
            { title: "Yamal Man of the Match", score: "88/100", status: "Pending" },
            { title: "Arsenal signs striker", score: "72/100", status: "Open" }
        ],
        activity: [
            {
                title: "Top comment",
                text: "Yamal is attacking the left side every time. Unreal confidence."
            },
            {
                title: "Transfer take",
                text: "Barcelona should focus on a defensive midfielder before another winger."
            }
        ]
    },
    analyst: {
        name: "Football Analyst",
        username: "analyst",
        avatar: "A",
        verified: true,
        rank: "#12",
        level: "Verified Voice",
        favoriteClub: "Neutral",
        bio: "Tactical analysis, match threads and transfer insight.",
        followers: 2400,
        following: 91,
        likes: 18200,
        comments: 512,
        reputation: 84210,
        predictionAccuracy: "88%",
        correctPredictions: 1204,
        badges: ["Elite Analyst", "Verified Voice", "Transfer Guru", "Top 1%"],
        clubs: [
            { name: "Premier League", link: "stillinger.html?league=PL" },
            { name: "Champions League", link: "#" }
        ],
        predictions: [
            { title: "Liverpool dominate midfield", score: "91/100", status: "Correct" },
            { title: "Late goal changes the match", score: "84/100", status: "Correct" }
        ],
        activity: [
            {
                title: "Match insight",
                text: "The key change was the pressing trigger after the first goal."
            },
            {
                title: "Transfer prediction",
                text: "This deal only makes sense if the wage structure stays controlled."
            }
        ]
    }
};

function formatNumber(number) {
    return Number(number).toLocaleString("da-DK");
}

function getFollowingUsers() {
    const saved = localStorage.getItem("shinpad_following_users");
    return saved ? JSON.parse(saved) : [];
}

function saveFollowingUsers(users) {
    localStorage.setItem("shinpad_following_users", JSON.stringify(users));
}

function isFollowing(username) {
    return getFollowingUsers().includes(username);
}

function renderProfile() {
    const profile = profiles[username] || profiles.sebastian;
    const following = isFollowing(profile.username);

    profilePage.innerHTML = `
        <section class="profile-cover"></section>

        <section class="profile-hero profile-hero-v2">
            <div class="profile-avatar">${profile.avatar}</div>

            <div class="profile-main-info">
                <div class="profile-title-row">
                    <h1 class="profile-name">
                        ${profile.name}
                        ${profile.verified ? `<span class="verified-badge">✓</span>` : ""}
                    </h1>

                    <button class="follow-button ${following ? "following" : ""}" onclick="toggleFollow('${profile.username}')">
                        ${following ? "Following" : "Follow"}
                    </button>
                </div>

                <p class="profile-username">@${profile.username} • ${profile.favoriteClub} • ${profile.rank} global</p>
                <p class="profile-bio">${profile.bio}</p>

                <div class="profile-badges">
                    ${profile.badges.map(badge => `<span>${badge}</span>`).join("")}
                </div>
            </div>
        </section>

        <section class="profile-stats">
            <div class="profile-stat">
                <h3>Followers</h3>
                <p>${formatNumber(profile.followers + (following ? 1 : 0))}</p>
            </div>

            <div class="profile-stat">
                <h3>Following</h3>
                <p>${formatNumber(profile.following)}</p>
            </div>

            <div class="profile-stat">
                <h3>Likes</h3>
                <p>${formatNumber(profile.likes)}</p>
            </div>

            <div class="profile-stat">
                <h3>Comments</h3>
                <p>${formatNumber(profile.comments)}</p>
            </div>
        </section>

        <section class="profile-stats">
            <div class="profile-stat profile-highlight">
                <h3>Accuracy</h3>
                <p>${profile.predictionAccuracy}</p>
            </div>

            <div class="profile-stat">
                <h3>Correct Predictions</h3>
                <p>${formatNumber(profile.correctPredictions)}</p>
            </div>

            <div class="profile-stat">
                <h3>Reputation</h3>
                <p>${formatNumber(profile.reputation)}</p>
            </div>

            <div class="profile-stat">
                <h3>Level</h3>
                <p>${profile.level}</p>
            </div>
        </section>

        <section class="profile-section">
            <h2>Favourite clubs</h2>

            <div class="profile-badges club-links">
                ${profile.clubs.map(club => `
                    <a href="${club.link}">
                        <span>${club.name}</span>
                    </a>
                `).join("")}
            </div>
        </section>

        <section class="profile-section">
            <h2>Predictions</h2>

            <div class="prediction-list">
                ${profile.predictions.map(prediction => `
                    <div class="prediction-card">
                        <div>
                            <strong>${prediction.title}</strong>
                            <p>${prediction.status}</p>
                        </div>

                        <span>${prediction.score}</span>
                    </div>
                `).join("")}
            </div>
        </section>

        <section class="profile-section">
            <h2>Recent activity</h2>

            ${profile.activity.map(item => `
                <div class="activity-card">
                    <strong>${item.title}</strong>
                    <p>${item.text}</p>
                </div>
            `).join("")}
        </section>

        <section class="profile-section">
            <h2>Your following list</h2>
            <div class="profile-badges club-links">
                ${getFollowingUsers().length > 0
            ? getFollowingUsers().map(user => `
                        <a href="profile.html?user=${user}">
                            <span>@${user}</span>
                        </a>
                    `).join("")
            : `<span>You are not following anyone yet.</span>`
        }
            </div>
        </section>
    `;
}

function toggleFollow(targetUsername) {
    let followingUsers = getFollowingUsers();

    if (followingUsers.includes(targetUsername)) {
        followingUsers = followingUsers.filter(user => user !== targetUsername);
    } else {
        followingUsers.push(targetUsername);
    }

    saveFollowingUsers(followingUsers);
    renderProfile();
}

renderProfile();