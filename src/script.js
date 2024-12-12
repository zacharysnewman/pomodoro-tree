// DEBUG: Uncomment the line below to reset the save data
// localStorage.removeItem("treeData");

// App State
const treeData = JSON.parse(localStorage.getItem("treeData")) || {
  treeLevel: 0, // Initial level starts at Seed
  progressMinutes: 0,
  treeCount: 0 // New treeCount property
};
treeData.treeCount = treeData.treeCount ?? 0;

const levelIcons = ["🌰", "🌱", "🌿", "🌳", "🌰"]; // Added Seed (🌰) to the icons
const levelNames = ["Seed", "Seedling", "Sapling", "Tree"];
const stageProgress = [30, 60, 120, 15]; // Progress thresholds in minutes for each stage

// DOM Elements
const timerDisplay = document.querySelector(".timer-display");
const treeLevelName = document.querySelector(".tree-level-name");
const treeElement = document.querySelector(".tree");
const progressBar = document.querySelector(".progress-fill");
const progressTimer = document.querySelector(".progress-timer"); // Secondary progress bar
const progressText = document.querySelector(".progress-text");
const levelLeft = document.querySelector(".level-left");
const levelRight = document.querySelector(".level-right");
const buttons = document.querySelectorAll("button");
const treeCountDisplay = document.querySelector(".tree-count"); // Element to display tree count

let timer = null;
let remainingTime = 0;

// Update UI
function updateUI() {
  // Update tree display
  treeElement.textContent = levelIcons[treeData.treeLevel];
  treeLevelName.textContent = levelNames[treeData.treeLevel];
  levelLeft.textContent = levelIcons[treeData.treeLevel];
  levelRight.textContent =
	levelIcons[Math.min(treeData.treeLevel + 1, levelIcons.length - 1)];

  // Update progress bar
  const maxStageProgress = stageProgress[treeData.treeLevel];
  const percentage = (treeData.progressMinutes / maxStageProgress) * 100;
  progressBar.style.width = `${percentage}%`;

  // Reset the timer overlay when the timer is not active
  if (!timer) progressTimer.style.width = "0%";

  // Update progress text
  progressText.textContent = `${treeData.progressMinutes}/${maxStageProgress} minutes`;

  // Update tree count display
  treeCountDisplay.textContent = `🌳: ${treeData.treeCount}`;

  // Save to localStorage
  localStorage.setItem("treeData", JSON.stringify(treeData));
}

// Start Timer
function startTimer(duration) {
  if (timer) clearInterval(timer); // Clear any existing timer
  remainingTime = duration * 60;

  // Update Timer Display
  updateTimerDisplay();

  // Timer Interval
  timer = setInterval(() => {
	remainingTime -= 1;

	// Update Secondary Progress Bar
	updateTimerProgress(duration);

	// Timer Completed
	if (remainingTime <= 0) {
	  clearInterval(timer);
	  timer = null;

	  // Add progress and check level up
	  treeData.progressMinutes += duration;
	  const maxStageProgress = stageProgress[treeData.treeLevel];

	  if (treeData.progressMinutes >= maxStageProgress) {
		treeData.treeLevel += 1;
		treeData.progressMinutes -= maxStageProgress;

		// If tree reaches the "Tree" level, increment treeCount and reset
		if (treeData.treeLevel === 4) {
		  treeData.treeCount += 1;
		  treeData.treeLevel = 0; // Reset to Seed stage
		  treeData.progressMinutes = 0;
		}
	  }

	  // Reset Timer Progress
	  progressTimer.style.width = "0%";

	  updateUI();
	  timerDisplay.textContent = "Grow your tree...";
	} else {
	  updateTimerDisplay();
	}
  }, 1000);

  // Focus Detection
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

// Update Timer Progress
function updateTimerProgress(duration) {
  const maxStageProgress = stageProgress[treeData.treeLevel] * 60; // Convert maxStageProgress to seconds
  const treeProgressSeconds = treeData.progressMinutes * 60; // Convert treeData progress to seconds

  // Combine both tree progress (converted to seconds) and timer progress, scaled by maxStageProgress
  // The progress should start at 0 and increase as both the tree data and the timer progress.
  const combinedProgress = (treeProgressSeconds + (duration * 60 - remainingTime)) / maxStageProgress;

  // Update the progress bar width, ensuring it doesn't exceed 100%
  progressTimer.style.width = `${Math.min(combinedProgress * 100 + 0.5, 100)}%`;
}




// Update Timer Display
function updateTimerDisplay() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Cancel Timer
function cancelTimer() {
  clearInterval(timer);
  timer = null;
  timerDisplay.textContent = "Growth requires focus...";
  progressTimer.style.width = "0%"; // Clear the timer progress
  document.removeEventListener("visibilitychange", handleVisibilityChange);
}

// Handle Focus Loss
function handleVisibilityChange() {
  if (document.hidden) cancelTimer();
}

// Button Clicks
buttons.forEach((button) => {
  button.addEventListener("click", () => {
	const duration = parseInt(button.getAttribute("data-time"));
	startTimer(duration);
  });
});

// Initial UI Update
updateUI();
