// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const attendeeList = document.getElementById("attendeeList");
const clearAttendeesBtn = document.getElementById("clearAttendeesBtn");
const waterCard = document.querySelector(".team-card.water");
const zeroCard = document.querySelector(".team-card.zero");
const powerCard = document.querySelector(".team-card.power");

// Track attendence
let count = 0;
const maxCount = 50;
let goalReached = false;
let attendees = [];
const storageKeys = {
  count: "attendance-count",
  water: "team-water-count",
  zero: "team-zero-count",
  power: "team-power-count",
  goal: "attendance-goal-reached",
  attendees: "attendee-list",
};

function getTeamCount(teamId) {
  const teamCounter = document.getElementById(teamId + "Count");
  return parseInt(teamCounter.textContent, 10);
}

function highlightWinningTeams() {
  const teams = [
    { id: "water", card: waterCard },
    { id: "zero", card: zeroCard },
    { id: "power", card: powerCard },
  ];

  let maxTeamCount = 0;
  let winners = [];

  teams.forEach(function (team) {
    team.card.classList.remove("winner");
  });

  teams.forEach(function (team) {
    const teamCount = getTeamCount(team.id);
    if (teamCount > maxTeamCount) {
      maxTeamCount = teamCount;
    }
  });

  teams.forEach(function (team) {
    const teamCount = getTeamCount(team.id);
    if (teamCount === maxTeamCount) {
      team.card.classList.add("winner");
      const teamName = team.card.querySelector(".team-name").textContent;
      winners.push(teamName);
    }
  });

  return winners;
}

function updateAttendanceDisplay() {
  const percentValue = Math.min(Math.round((count / maxCount) * 100), 100);
  const percentage = `${percentValue}%`;
  attendeeCount.textContent = count;
  progressBar.style.width = percentage;
}

function resetAttendees() {
  count = 0;
  goalReached = false;
  attendees = [];

  document.getElementById("waterCount").textContent = "0";
  document.getElementById("zeroCount").textContent = "0";
  document.getElementById("powerCount").textContent = "0";

  waterCard.classList.remove("winner");
  zeroCard.classList.remove("winner");
  powerCard.classList.remove("winner");

  greeting.textContent = "";
  greeting.classList.remove("success-message");
  greeting.classList.remove("celebration-message");
  greeting.style.display = "none";

  updateAttendanceDisplay();
  renderAttendeeList();
  saveCounts();
}

function addAttendeeToList(attendee) {
  const listItem = document.createElement("li");
  listItem.classList.add("attendee-item");

  const nameSpan = document.createElement("span");
  nameSpan.classList.add("attendee-name");
  nameSpan.textContent = attendee.name;

  const teamSpan = document.createElement("span");
  teamSpan.classList.add("attendee-team");
  teamSpan.textContent = attendee.team;

  listItem.appendChild(nameSpan);
  listItem.appendChild(teamSpan);
  attendeeList.appendChild(listItem);
}

function renderAttendeeList() {
  attendeeList.innerHTML = "";

  if (attendees.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.classList.add("attendee-empty");
    emptyItem.textContent = "No attendees yet.";
    attendeeList.appendChild(emptyItem);
    return;
  }

  attendees.forEach(function (attendee) {
    addAttendeeToList(attendee);
  });
}

function saveCounts() {
  localStorage.setItem(storageKeys.count, count);
  localStorage.setItem(storageKeys.water, getTeamCount("water"));
  localStorage.setItem(storageKeys.zero, getTeamCount("zero"));
  localStorage.setItem(storageKeys.power, getTeamCount("power"));
  localStorage.setItem(storageKeys.goal, goalReached);
  localStorage.setItem(storageKeys.attendees, JSON.stringify(attendees));
}

function loadCounts() {
  const storedCount = parseInt(localStorage.getItem(storageKeys.count), 10);
  if (!isNaN(storedCount)) {
    count = storedCount;
  }

  const waterStored = parseInt(localStorage.getItem(storageKeys.water), 10);
  const zeroStored = parseInt(localStorage.getItem(storageKeys.zero), 10);
  const powerStored = parseInt(localStorage.getItem(storageKeys.power), 10);

  if (!isNaN(waterStored)) {
    document.getElementById("waterCount").textContent = waterStored;
  }
  if (!isNaN(zeroStored)) {
    document.getElementById("zeroCount").textContent = zeroStored;
  }
  if (!isNaN(powerStored)) {
    document.getElementById("powerCount").textContent = powerStored;
  }

  const storedAttendees = localStorage.getItem(storageKeys.attendees);
  if (storedAttendees) {
    try {
      const parsedAttendees = JSON.parse(storedAttendees);
      if (Array.isArray(parsedAttendees)) {
        attendees = parsedAttendees;
      }
    } catch (error) {
      attendees = [];
    }
  }

  goalReached = localStorage.getItem(storageKeys.goal) === "true";
  if (count >= maxCount) {
    goalReached = true;
  }

  updateAttendanceDisplay();
  renderAttendeeList();

  if (goalReached) {
    const winners = highlightWinningTeams();
    const winnersText = winners.join(" and ");
    greeting.textContent = `Goal reached! ${maxCount} attendees checked in. Winning team: ${winnersText}!`;
    greeting.classList.add("celebration-message");
    greeting.style.display = "block";
  }
}

loadCounts();

clearAttendeesBtn.addEventListener("click", function () {
  resetAttendees();
});

// Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get form values
  const name = nameInput.value;
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  console.log(name, team, teamName);

  // Increment count
  count++;
  console.log("Total check-ins:", count);

  // Update progress bar
  updateAttendanceDisplay();

  // Update team counter
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent, 10) + 1;

  // Show welcome message
  const message = `Welcome, ${name} from ${teamName}!`;
  console.log(message);
  greeting.textContent = message;
  greeting.classList.add("success-message");
  greeting.style.display = "block";

  attendees.push({ name: name, team: teamName });
  renderAttendeeList();

  if (!goalReached && count >= maxCount) {
    goalReached = true;
    attendeeCount.textContent = maxCount;
    progressBar.style.width = "100%";

    const winners = highlightWinningTeams();
    const winnersText = winners.join(" and ");
    greeting.textContent = `Goal reached! ${maxCount} attendees checked in. Winning team: ${winnersText}!`;
    greeting.classList.add("celebration-message");
  }

  saveCounts();

  form.reset();
});
