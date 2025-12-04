// backend/server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend from /public
app.use(express.static("public"));

// ========== DATA ==========

const GROUPS = Array.from({ length: 12 }, (_, i) =>
  String.fromCharCode("A".charCodeAt(0) + i)
);

const pots = {
  1: [
    "USA", "Mexico", "Canada", "Spain", "Argentina", "France",
    "England", "Portugal", "Brazil", "Netherlands", "Belgium", "Germany"
  ],
  2: [
    "Croatia", "Morocco", "Colombia", "Uruguay", "Switzerland", "Senegal",
    "Denmark", "Japan", "Iran", "South Korea", "Ecuador", "Australia"
  ],
  3: [
    "Austria", "Panama", "Norway", "Egypt", "Algeria", "Paraguay",
    "Tunisia", "Ivory Coast", "Costa Rica", "Uzbekistan", "Qatar",
    "South Africa"
  ],
  4: [
    "Saudi Arabia", "Jordan", "Cape Verde", "Jamaica", "Ghana",
    "New Zealand", "Italy", "Turkiye", "Ukraine", "Wales", "Nigeria",
    "Bolivia"
  ]
};

// confederations
const confedByTeam = {
  // UEFA
  "Spain": "UEFA", "France": "UEFA", "England": "UEFA", "Portugal": "UEFA",
  "Netherlands": "UEFA", "Belgium": "UEFA", "Germany": "UEFA",
  "Croatia": "UEFA", "Denmark": "UEFA", "Switzerland": "UEFA",
  "Norway": "UEFA", "Austria": "UEFA", "Turkiye": "UEFA",
  "Ukraine": "UEFA", "Wales": "UEFA", "Italy": "UEFA",

  // CONMEBOL
  "Argentina": "CONMEBOL", "Brazil": "CONMEBOL", "Colombia": "CONMEBOL",
  "Uruguay": "CONMEBOL", "Ecuador": "CONMEBOL", "Paraguay": "CONMEBOL",
  "Bolivia": "CONMEBOL",

  // CONCACAF
  "USA": "CONCACAF", "Mexico": "CONCACAF", "Canada": "CONCACAF",
  "Panama": "CONCACAF", "Costa Rica": "CONCACAF", "Jamaica": "CONCACAF",

  // CAF
  "Morocco": "CAF", "Senegal": "CAF", "Tunisia": "CAF", "Ivory Coast": "CAF",
  "Algeria": "CAF", "Egypt": "CAF", "Ghana": "CAF", "Nigeria": "CAF",
  "Cape Verde": "CAF", "South Africa": "CAF",

  // AFC
  "Japan": "AFC", "Iran": "AFC", "South Korea": "AFC", "Australia": "AFC",
  "Uzbekistan": "AFC", "Qatar": "AFC", "Saudi Arabia": "AFC", "Jordan": "AFC",

  // OFC
  "New Zealand": "OFC"
};

// ========== UTILS ==========

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Updated rule: max 2 from a confed (including UEFA)
function allowedInGroup(groupTeams, teamName) {
  const teamConf = confedByTeam[teamName];
  let count = 0;
  for (const t of groupTeams) {
    if (confedByTeam[t] === teamConf) count++;
  }
  return count < 2; // allow at most 1 existing; adding makes 2 max
}

function groupsStateOk(groups) {
  for (const g of GROUPS) {
    const teams = groups[g];
    if (teams.length > 4) return false;

    const confCounts = {};
    for (const t of teams) {
      const c = confedByTeam[t];
      confCounts[c] = (confCounts[c] || 0) + 1;
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

function backtrackAssignPot(groups, teams, steps, potNumber) {
  if (teams.length === 0) return true;

  const sorted = [...teams].sort(
    (a, b) =>
      candidateGroupsForTeam(groups, a).length -
      candidateGroupsForTeam(groups, b).length
  );

  const team = sorted[0];
  const remaining = teams.filter(t => t !== team);
  let candidates = candidateGroupsForTeam(groups, team);
  candidates = shuffle(candidates);

  for (const g of candidates) {
    groups[g].push(team);
    steps.push({ team, group: g, pot: potNumber });

    if (groupsStateOk(groups) && backtrackAssignPot(groups, remaining, steps, potNumber)) {
      return true;
    }

    steps.pop();
    groups[g].pop();
  }

  return false;
}

function simulateDrawWithSteps() {
  const groups = {};
  GROUPS.forEach(g => (groups[g] = []));
  const steps = [];

  // fixed hosts: Mexico -> A, Canada -> B, USA -> D
  const hostAssignments = [
    { team: "Mexico", group: "A" },
    { team: "Canada", group: "B" },
    { team: "USA", group: "D" }
  ];

  for (const h of hostAssignments) {
    groups[h.group].push(h.team);
    steps.push({ team: h.team, group: h.group, pot: 1 });
  }

  const hostNames = hostAssignments.map(h => h.team);
  const remainingPot1 = pots[1].filter(name => !hostNames.includes(name));
  const shuffledPot1 = shuffle(remainingPot1);

  const emptyGroups = GROUPS.filter(g => groups[g].length === 0);
  let idx = 0;
  for (const g of emptyGroups) {
    const team = shuffledPot1[idx++];
    groups[g].push(team);
    steps.push({ team, group: g, pot: 1 });
  }

  // Pots 2-4
  for (const potNumber of [2, 3, 4]) {
    const teams = shuffle(pots[potNumber]);
    const ok = backtrackAssignPot(groups, teams, steps, potNumber);
    if (!ok) {
      console.warn("Failed attempt, retrying whole draw...");
      return simulateDrawWithSteps();
    }
  }

  return { groups, steps };
}

// ========== API ROUTE ==========

app.get("/api/draw", (req, res) => {
  try {
    const result = simulateDrawWithSteps();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate draw" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});