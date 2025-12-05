// app.js – front-end only (no backend /api needed)

// ======================
// CONSTANTS / DATA
// ======================

const GROUPS = Array.from({ length: 12 }, (_, i) =>
  String.fromCharCode("A".charCodeAt(0) + i)
);

const pots = {
  1: [
    { name: "USA", flag: "🇺🇸" },
    { name: "Mexico", flag: "🇲🇽" },
    { name: "Canada", flag: "🇨🇦" },
    { name: "Spain", flag: "🇪🇸" },
    { name: "Argentina", flag: "🇦🇷" },
    { name: "France", flag: "🇫🇷" },
    { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "Portugal", flag: "🇵🇹" },
    { name: "Brazil", flag: "🇧🇷" },
    { name: "Netherlands", flag: "🇳🇱" },
    { name: "Belgium", flag: "🇧🇪" },
    { name: "Germany", flag: "🇩🇪" }
  ],
  2: [
    { name: "Croatia", flag: "🇭🇷" },
    { name: "Morocco", flag: "🇲🇦" },
    { name: "Colombia", flag: "🇨🇴" },
    { name: "Uruguay", flag: "🇺🇾" },
    { name: "Switzerland", flag: "🇨🇭" },
    { name: "Senegal", flag: "🇸🇳" },
    { name: "Austria", flag: "🇦🇹" },
    { name: "Japan", flag: "🇯🇵" },
    { name: "Iran", flag: "🇮🇷" },
    { name: "South Korea", flag: "🇰🇷" },
    { name: "Ecuador", flag: "🇪🇨" },
    { name: "Australia", flag: "🇦🇺" }
  ],
  3: [
    { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
    { name: "Panama", flag: "🇵🇦" },
    { name: "Norway", flag: "🇳🇴" },
    { name: "Egypt", flag: "🇪🇬" },
    { name: "Algeria", flag: "🇩🇿" },
    { name: "Paraguay", flag: "🇵🇾" },
    { name: "Tunisia", flag: "🇹🇳" },
    { name: "Ivory Coast", flag: "🇨🇮" },
    { name: "Saudi Arabia", flag: "🇸🇦" },
    { name: "Uzbekistan", flag: "🇺🇿" },
    { name: "Qatar", flag: "🇶🇦" },
    { name: "South Africa", flag: "🇿🇦" }
  ],
  4: [
    { name: "Curacao", flag: "🇨🇼" },
    { name: "Jordan", flag: "🇯🇴" },
    { name: "Cape Verde", flag: "🇨🇻" },
    { name: "Haiti", flag: "🇭🇹" },
    { name: "Ghana", flag: "🇬🇭" },
    { name: "New Zealand", flag: "🇳🇿" },
    { name: "Italy", flag: "🇮🇹" },
    { name: "Turkiye", flag: "🇹🇷" },
    { name: "Ukraine", flag: "🇺🇦" },
    { name: "Denmark", flag: "🇩🇰" },
    { name: "DR Congo", flag: "🇨🇩" },
    { name: "Bolivia", flag: "🇧🇴" }
  ]
};

// Confederations – updated to cover all current teams
const confedByTeam = {
  // UEFA
  "Spain": "UEFA", "France": "UEFA", "England": "UEFA", "Portugal": "UEFA",
  "Netherlands": "UEFA", "Belgium": "UEFA", "Germany": "UEFA",
  "Croatia": "UEFA", "Denmark": "UEFA", "Switzerland": "UEFA",
  "Norway": "UEFA", "Austria": "UEFA", "Turkiye": "UEFA",
  "Ukraine": "UEFA", "Italy": "UEFA", "Scotland": "UEFA",

  // CONMEBOL
  "Argentina": "CONMEBOL", "Brazil": "CONMEBOL", "Colombia": "CONMEBOL",
  "Uruguay": "CONMEBOL", "Ecuador": "CONMEBOL", "Paraguay": "CONMEBOL",
  "Bolivia": "CONMEBOL",

  // CONCACAF
  "USA": "CONCACAF", "Mexico": "CONCACAF", "Canada": "CONCACAF",
  "Panama": "CONCACAF", "Curacao": "CONCACAF", "Haiti": "CONCACAF",
  // (Costa Rica, Jamaica not currently in pots but keep if you like)
  "Costa Rica": "CONCACAF", "Jamaica": "CONCACAF",

  // CAF
  "Morocco": "CAF", "Senegal": "CAF", "Tunisia": "CAF", "Ivory Coast": "CAF",
  "Algeria": "CAF", "Egypt": "CAF", "Ghana": "CAF", "DR Congo": "CAF",
  "Cape Verde": "CAF", "South Africa": "CAF",

  // AFC
  "Japan": "AFC", "Iran": "AFC", "South Korea": "AFC", "Australia": "AFC",
  "Uzbekistan": "AFC", "Qatar": "AFC", "Saudi Arabia": "AFC", "Jordan": "AFC",

  // OFC
  "New Zealand": "OFC"
};

// Optional sanity check: log any missing confederation mapping
(function checkConfeds() {
  const allTeams = new Set(Object.values(pots).flat().map(t => t.name));
  const missing = [...allTeams].filter(t => !confedByTeam[t]);
  if (missing.length) {
    console.error("Missing confed mapping for:", missing);
  }
})();

// ======================
// UTILITIES
// ======================

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function getTeamInfoByName(name) {
  for (const pot of Object.values(pots)) {
    for (const t of pot) {
      if (t.name === name) return t;
    }
  }
  return { name, flag: "" };
}

// ======================
// CONFEDERATION RULES
// ======================

// Max 2 teams from the same confederation per group (UEFA included)
function allowedInGroup(groupTeams, teamName) {
  const teamConf = confedByTeam[teamName];
  let count = 0;
  for (const t of groupTeams) {
    if (confedByTeam[t] === teamConf) count++;
  }
  return count < 2; // adding this team must not exceed 2
}

function groupsStateOk(groups) {
  for (const g of GROUPS) {
    const teams = groups[g];

    // No more than 4 teams in a group
    if (teams.length > 4) return false;

    const confCounts = {};
    for (const t of teams) {
      const c = confedByTeam[t];
      confCounts[c] = (confCounts[c] || 0) + 1;

      // New rule: max 2 from same confederation (UEFA included)
      if (confCounts[c] > 2) return false;
    }
  }
  return true;
}

function candidateGroupsForTeam(groups, teamName) {
  const cands = [];
  for (const g of GROUPS) {
    if (groups[g].length < 4 && allowedInGroup(groups[g], teamName)) {
      cands.push(g);
    }
  }
  return cands;
}

// Backtracking placement for one pot
function backtrackAssignPot(groups, teams, steps, potNumber) {
  if (teams.length === 0) return true;

  // MRV heuristic: pick team with fewest valid candidate groups
  const sorted = [...teams].sort(
    (a, b) =>
      candidateGroupsForTeam(groups, a).length -
      candidateGroupsForTeam(groups, b).length
  );
  const team = sorted[0];
  const remaining = teams.filter(t => t !== team);

  let candidates = candidateGroupsForTeam(groups, team);
  shuffle(candidates);

  for (const g of candidates) {
    groups[g].push(team);
    steps.push({ team, group: g, pot: potNumber });

    if (groupsStateOk(groups) && backtrackAssignPot(groups, remaining, steps, potNumber)) {
      return true;
    }

    // backtrack
    steps.pop();
    groups[g].pop();
  }
  return false;
}

// ======================
// DRAW SIMULATION
// ======================

// Returns { groups, steps } where steps is an ordered list of draw actions
function simulateDrawWithSteps() {
  const groups = {};
  GROUPS.forEach(g => (groups[g] = []));
  const steps = [];

  // Hosts in specific groups:
  // Mexico -> A, Canada -> B, USA -> D
  const hostAssignments = [
    { team: "Mexico", group: "A" },
    { team: "Canada", group: "B" },
    { team: "USA", group: "D" }
  ];
  for (const h of hostAssignments) {
    groups[h.group].push(h.team);
    steps.push({ team: h.team, group: h.group, pot: 1 });
  }

  // Remaining Pot 1 teams
  const hostNames = hostAssignments.map(h => h.team);
  const remainingPot1 = pots[1]
    .map(t => t.name)
    .filter(n => !hostNames.includes(n));
  shuffle(remainingPot1);

  // Fill groups that don't yet have a Pot 1 team
  const emptyGroups = GROUPS.filter(g => groups[g].length === 0);
  let idx = 0;
  for (const g of emptyGroups) {
    const team = remainingPot1[idx++];
    groups[g].push(team);
    steps.push({ team, group: g, pot: 1 });
  }

  // Pots 2–4 with backtracking
  for (const potNumber of [2, 3, 4]) {
    const teams = pots[potNumber].map(t => t.name);
    shuffle(teams);

    const ok = backtrackAssignPot(groups, teams, steps, potNumber);
    if (!ok) {
      console.warn("Backtracking failed; retrying full draw...");
      // Very unlikely; if it fails, start over
      return simulateDrawWithSteps();
    }
  }

  return { groups, steps };
}

// ======================
// DOM & RENDERING
// ======================

const potsContainer = document.getElementById("pots-container");
const groupsContainer = document.getElementById("groups-container");
const statusText = document.getElementById("status-text");
const simulateBtn = document.getElementById("simulate-btn");
const skipBtn = document.getElementById("skip-btn");

function renderPots() {
  potsContainer.innerHTML = "";
  for (const potNumber of [1, 2, 3, 4]) {
    const card = document.createElement("div");
    card.className = "pot-card";

    const title = document.createElement("div");
    title.className = "pot-title";
    title.textContent = `Pot ${potNumber}`;
    card.appendChild(title);

    const ul = document.createElement("ul");
    ul.className = "pot-list";

    for (const team of pots[potNumber]) {
      const li = document.createElement("li");
      li.className = "team";
      li.id = `team-${slugify(team.name)}`;
      li.dataset.teamName = team.name;

      const flagSpan = document.createElement("span");
      flagSpan.className = "flag";
      flagSpan.textContent = team.flag;

      const nameSpan = document.createElement("span");
      nameSpan.textContent = team.name;

      li.appendChild(flagSpan);
      li.appendChild(nameSpan);
      ul.appendChild(li);
    }

    card.appendChild(ul);
    potsContainer.appendChild(card);
  }
}

function renderGroups() {
  groupsContainer.innerHTML = "";
  for (const g of GROUPS) {
    const card = document.createElement("div");
    card.className = "group-card";
    card.id = `group-${g}`;

    const header = document.createElement("div");
    header.className = "group-header";

    const name = document.createElement("div");
    name.className = "group-name";
    name.textContent = `Group ${g}`;

    const potLabel = document.createElement("div");
    potLabel.className = "group-pot-label";
    potLabel.textContent = "Drawn teams:";

    header.appendChild(name);
    header.appendChild(potLabel);

    const ul = document.createElement("ul");
    ul.className = "group-team-list";
    ul.dataset.groupName = g;

    card.appendChild(header);
    card.appendChild(ul);
    groupsContainer.appendChild(card);
  }
}

function clearVisualization() {
  // Clear group lists
  for (const g of GROUPS) {
    const ul = document.querySelector(`#group-${g} .group-team-list`);
    if (ul) ul.innerHTML = "";
  }
  // Reset pot team styling
  document
    .querySelectorAll(".team.drawn")
    .forEach(el => el.classList.remove("drawn"));
}

function applyStep(step) {
  const { team, group } = step;
  const teamInfo = getTeamInfoByName(team);

  // Mark team as drawn in its pot
  const potEntry = document.getElementById(`team-${slugify(team)}`);
  if (potEntry) {
    potEntry.classList.add("drawn");
  }

  // Add to group list
  const ul = document.querySelector(`#group-${group} .group-team-list`);
  if (ul) {
    const li = document.createElement("li");
    li.textContent = `${teamInfo.flag} ${teamInfo.name}`;
    ul.appendChild(li);
  }
}

// ======================
// ANIMATION CONTROL
// ======================

let currentSteps = [];
let currentStepIndex = 0;
let drawIntervalId = null;
const STEP_DELAY_MS = 550;

function stopAnimation() {
  if (drawIntervalId !== null) {
    clearInterval(drawIntervalId);
    drawIntervalId = null;
  }
}

function startAnimation(steps) {
  stopAnimation();
  currentSteps = steps;
  currentStepIndex = 0;
  if (!steps.length) return;

  statusText.textContent = "Drawing teams...";

  drawIntervalId = setInterval(() => {
    if (currentStepIndex >= currentSteps.length) {
      stopAnimation();
      statusText.textContent = "Draw completed. Click “Simulate Draw” to run again.";
      return;
    }

    const step = currentSteps[currentStepIndex++];
    applyStep(step);
    const potLabel = step.pot ? `Pot ${step.pot}` : "Pot ?";
    statusText.textContent =
      `Drawn ${step.team} into Group ${step.group} (${potLabel})`;
  }, STEP_DELAY_MS);
}

function runSimulation() {
  stopAnimation();
  clearVisualization();
  statusText.textContent = "Computing valid draw...";

  // Small timeout so UI updates before heavy calculation
  setTimeout(() => {
    const { steps } = simulateDrawWithSteps();
    startAnimation(steps);
  }, 10);
}

function skipAnimationToEnd() {
  if (!currentSteps.length) return;
  stopAnimation();
  clearVisualization();
  for (const step of currentSteps) {
    applyStep(step);
  }
  statusText.textContent = "Draw completed (skipped animation).";
}

// ======================
// INIT
// ======================

renderPots();
renderGroups();

simulateBtn.addEventListener("click", runSimulation);
skipBtn.addEventListener("click", skipAnimationToEnd);