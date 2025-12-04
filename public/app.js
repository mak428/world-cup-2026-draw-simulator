// public/app.js

// same DOM stuff as before (renderPots, renderGroups, etc.)
// BUT instead of simulateDrawWithSteps() locally, call the API.

const statusText = document.getElementById("status-text");
const simulateBtn = document.getElementById("simulate-btn");
const skipBtn = document.getElementById("skip-btn");

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

function clearVisualization() {
  // clear groups + reset pot item classes as in previous version
}

function applyStep(step) {
  // same as before: update pot entry + group list
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

async function runSimulation() {
  stopAnimation();
  clearVisualization();
  statusText.textContent = "Requesting draw from server...";

  try {
    const res = await fetch("/api/draw");
    if (!res.ok) throw new Error("HTTP error: " + res.status);
    const data = await res.json();
    startAnimation(data.steps);
  } catch (err) {
    console.error(err);
    statusText.textContent = "Error requesting draw.";
  }
}

function skipAnimationToEnd() {
  if (!currentSteps.length) return;
  stopAnimation();
  clearVisualization();
  for (const step of currentSteps) applyStep(step);
  statusText.textContent = "Draw completed (skipped animation).";
}

simulateBtn.addEventListener("click", runSimulation);
skipBtn.addEventListener("click", skipAnimationToEnd);