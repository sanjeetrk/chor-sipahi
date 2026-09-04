// Game configurations based on YouTube Video
const ROLES = [
  { name: "Raja", symbol: "👑 Raja" },
  { name: "Wazir", symbol: "📜 Wazir" },
  { name: "Sipahi", symbol: "👮 Sipahi" },
  { name: "Chor", symbol: "🦹 Chor" }
];

let players = [];
let roundRoles = [];
let wazirIndex = -1;
let chorIndex = -1;
let sipahiIndex = -1;
let rajaIndex = -1;
let isGuessing = false;

// Step 1: Initialize players from input fields
function initializePlayers() {
  players = [];
  for (let i = 0; i < 4; i++) {
    const inputVal = document.getElementById(`name-input-${i}`).value.trim();
    const playerName = inputVal !== "" ? inputVal : `Player ${i + 1}`;

    players.push({
      id: i,
      name: playerName,
      currentRole: "-",
      roundScore: 0,
      totalScore: 0
    });

    document.getElementById(`label-name-${i}`).innerText = playerName;
  }

  document.getElementById("player-setup-screen").classList.add("hidden");
  document.getElementById("game-arena-screen").classList.remove("hidden");
  renderScoreboard();
}

// Fisher-Yates array shuffling
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Step 2: Start a new round
function startRound() {
  roundRoles = shuffle(ROLES);

  rajaIndex = roundRoles.findIndex(r => r.name === "Raja");
  wazirIndex = roundRoles.findIndex(r => r.name === "Wazir");
  sipahiIndex = roundRoles.findIndex(r => r.name === "Sipahi");
  chorIndex = roundRoles.findIndex(r => r.name === "Chor");

  // Video mechanics: Raja & Wazir are displayed
  for (let i = 0; i < 4; i++) {
    const cardEl = document.getElementById(`card-${i}`);
    const badgeEl = document.getElementById(`label-role-${i}`);
    cardEl.classList.remove("revealed");

    players[i].roundScore = 0;
    players[i].currentRole = "❓";

    if (i === rajaIndex) {
      badgeEl.innerText = roundRoles[i].symbol;
      cardEl.classList.add("revealed");
      players[i].currentRole = "Raja";
    } else if (i === wazirIndex) {
      badgeEl.innerText = roundRoles[i].symbol;
      cardEl.classList.add("revealed");
      players[i].currentRole = "Wazir";
    } else {
      badgeEl.innerText = "❓";
    }
  }

  isGuessing = true;
  document.getElementById("status-text").innerHTML = 
    `🔍 <b>${players[wazirIndex].name}</b> (Wazir) guess karein: In dono me se <b>Chor</b> kaun hai?`;

  document.getElementById("deal-btn").disabled = true;
  renderScoreboard();
}

// Step 3: Handle card choice
function handleCardClick(clickedIndex) {
  if (!isGuessing) return;

  if (clickedIndex === rajaIndex || clickedIndex === wazirIndex) {
    alert("Wazir ko hidden cards (❓) me se select karna hai!");
    return;
  }

  const statusEl = document.getElementById("status-text");

  players[rajaIndex].roundScore = 1000;
  players[sipahiIndex].roundScore = 500;

  if (clickedIndex === chorIndex) {
    // Correct Guess: Wazir gets 800, Chor gets 0
    players[wazirIndex].roundScore = 800;
    players[chorIndex].roundScore = 0;
    statusEl.innerHTML = `✅ <b>Sahi Guess!</b> ${players[clickedIndex].name} Chor tha. Wazir (${players[wazirIndex].name}) ko mile 800 pts!`;
  } else {
    // Wrong Guess: Wazir & Chor points swap (Chor gets 800, Wazir gets 0)
    players[wazirIndex].roundScore = 0;
    players[chorIndex].roundScore = 800;
    statusEl.innerHTML = `❌ <b>Galat Guess!</b> ${players[clickedIndex].name} Sipahi tha. Chor (${players[chorIndex].name}) le gaya 800 pts!`;
  }

  // Finalize round & reveal cards
  for (let i = 0; i < 4; i++) {
    players[i].totalScore += players[i].roundScore;
    players[i].currentRole = roundRoles[i].name;

    const cardEl = document.getElementById(`card-${i}`);
    document.getElementById(`label-role-${i}`).innerText = roundRoles[i].symbol;
    cardEl.classList.add("revealed");
  }

  isGuessing = false;
  document.getElementById("deal-btn").disabled = false;
  document.getElementById("deal-btn").innerText = "Next Round ➡️";

  renderScoreboard();
}

// Step 4: Render dynamically sorted leaderboard with ranks
function renderScoreboard() {
  const tbody = document.getElementById("score-table-body");
  tbody.innerHTML = "";

  // Sort descending by total score
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);

  const rankBadges = ["🥇 #1", "🥈 #2", "🥉 #3", "4th"];

  sortedPlayers.forEach((p, index) => {
    const tr = document.createElement("tr");

    // Highlight top rank if score > 0
    if (index === 0 && p.totalScore > 0) {
      tr.classList.add("rank-1-row");
    }

    const rankLabel = rankBadges[index] || `#${index + 1}`;

    tr.innerHTML = `
      <td><span class="rank-badge">${rankLabel}</span></td>
      <td><b>${p.name}</b></td>
      <td>${p.currentRole}</td>
      <td style="color: ${p.roundScore > 0 ? '#10b981' : '#94a3b8'};">+${p.roundScore}</td>
      <td>${p.totalScore}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Step 5: Reset Game with browser confirmation
function confirmResetGame() {
  const userConfirmed = confirm("Kya aap game reset karke naye khiladiyo ke naam enter karna chahte hain?");
  
  if (userConfirmed) {
    // Reset state
    players = [];
    roundRoles = [];
    wazirIndex = -1;
    chorIndex = -1;
    sipahiIndex = -1;
    rajaIndex = -1;
    isGuessing = false;

    // Reset UI cards
    for (let i = 0; i < 4; i++) {
      const cardEl = document.getElementById(`card-${i}`);
      cardEl.classList.remove("revealed");
      document.getElementById(`label-role-${i}`).innerText = "❓";
    }

    // Reset buttons and status
    document.getElementById("deal-btn").disabled = false;
    document.getElementById("deal-btn").innerText = "Shuffle & Deal 🔀";
    document.getElementById("status-text").innerText = 'Click "Shuffle & Deal" to begin round!';

    // Hide arena and show player setup
    document.getElementById("game-arena-screen").classList.add("hidden");
    document.getElementById("player-setup-screen").classList.remove("hidden");
  }
}
