// Hardcoded admin credentials (for demo only - in production, use proper authentication)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "abhishek",
};

// DOM elements
const loginPage = document.getElementById("loginPage");
const mainNav = document.getElementById("mainNav");
const adminDashboard = document.getElementById("adminDashboard");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const resetElectionBtn = document.getElementById("resetElectionBtn");
const exportResultsBtn = document.getElementById("exportResultsBtn");
const addCandidateBtn = document.getElementById("addCandidateBtn");
const resetModal = document.getElementById("resetModal");
const cancelResetBtn = document.getElementById("cancelResetBtn");
const confirmResetBtn = document.getElementById("confirmResetBtn");
const addCandidateModal = document.getElementById("addCandidateModal");
const cancelAddCandidateBtn = document.getElementById("cancelAddCandidateBtn");
const saveCandidateBtn = document.getElementById("saveCandidateBtn");
const toggleVoting = document.getElementById("toggleVoting");

// Chart instance
let resultsChart = null;

// Sample candidates data (same as in vote.html)
let candidates = [
  {
    id: 1,
    name: "Alice Johnson",
    party: "Unity Party",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 2,
    name: "Bob Smith",
    party: "Progressive Alliance",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    name: "Charlie Brown",
    party: "Green Future",
    image: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    id: 4,
    name: "Diana Prince",
    party: "Independent",
    image: "https://randomuser.me/api/portraits/women/63.jpg",
  },
];

// Event listeners
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    // Successful login
    loginPage.classList.add("hidden");
    mainNav.classList.remove("hidden");
    adminDashboard.classList.remove("hidden");
    updateAdminDashboard();
  } else {
    alert("Invalid credentials. Please try again.");
  }
});

logoutBtn.addEventListener("click", () => {
  adminDashboard.classList.add("hidden");
  mainNav.classList.add("hidden");
  loginPage.classList.remove("hidden");
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
});

resetElectionBtn.addEventListener("click", () => {
  resetModal.classList.remove("hidden");
});

cancelResetBtn.addEventListener("click", () => {
  resetModal.classList.add("hidden");
});

confirmResetBtn.addEventListener("click", () => {
  // Reset all votes
  localStorage.setItem("votes", JSON.stringify({}));
  resetModal.classList.add("hidden");
  updateAdminDashboard();
  alert("Election has been reset. All vote data has been cleared.");
});

exportResultsBtn.addEventListener("click", () => {
  const votes = JSON.parse(localStorage.getItem("votes")) || {};
  const voteCounts = {};

  // Count votes per candidate
  Object.values(votes).forEach((candidateId) => {
    voteCounts[candidateId] = (voteCounts[candidateId] || 0) + 1;
  });

  // Prepare data for export
  const exportData = {
    timestamp: new Date().toISOString(),
    totalVotes: Object.keys(votes).length,
    candidates: candidates.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      votes: voteCounts[candidate.id] || 0,
    })),
  };

  // Create download link
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
  const exportFileDefaultName = `election-results-${
    new Date().toISOString().split("T")[0]
  }.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
});

addCandidateBtn.addEventListener("click", () => {
  addCandidateModal.classList.remove("hidden");
});

cancelAddCandidateBtn.addEventListener("click", () => {
  addCandidateModal.classList.add("hidden");
  document.getElementById("candidateName").value = "";
  document.getElementById("candidateParty").value = "";
  document.getElementById("candidateImage").value = "";
});

saveCandidateBtn.addEventListener("click", () => {
  const name = document.getElementById("candidateName").value.trim();
  const party = document.getElementById("candidateParty").value.trim();
  const image = document.getElementById("candidateImage").value.trim();

  if (!name) {
    alert("Please enter candidate name");
    return;
  }

  // Generate new ID
  const newId =
    candidates.length > 0 ? Math.max(...candidates.map((c) => c.id)) + 1 : 1;

  // Add new candidate
  candidates.push({
    id: newId,
    name,
    party: party || "Independent",
    image:
      image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=random`,
  });

  // Close modal and update dashboard
  addCandidateModal.classList.add("hidden");
  document.getElementById("candidateName").value = "";
  document.getElementById("candidateParty").value = "";
  document.getElementById("candidateImage").value = "";

  updateAdminDashboard();
  alert(`Candidate "${name}" added successfully!`);
});

toggleVoting.addEventListener("change", (e) => {
  const isOpen = e.target.checked;
  document.getElementById("adminVotingStatus").textContent = isOpen
    ? "Open"
    : "Closed";
  // In a real app, you would update this status in your backend/database
});

// Update admin dashboard with current data
function updateAdminDashboard() {
  const votes = JSON.parse(localStorage.getItem("votes")) || {};
  const voteCounts = {};

  // Count votes per candidate
  Object.values(votes).forEach((candidateId) => {
    voteCounts[candidateId] = (voteCounts[candidateId] || 0) + 1;
  });

  // Update stats
  document.getElementById("totalVotes").textContent = Object.keys(votes).length;
  document.getElementById("totalCandidates").textContent = candidates.length;

  // Prepare data for chart
  const candidateNames = candidates.map((c) => c.name);
  const candidateVotes = candidates.map((c) => voteCounts[c.id] || 0);
  const backgroundColors = [
    "rgba(59, 130, 246, 0.7)",
    "rgba(168, 85, 247, 0.7)",
    "rgba(16, 185, 129, 0.7)",
    "rgba(245, 158, 11, 0.7)",
    "rgba(239, 68, 68, 0.7)",
    "rgba(20, 184, 166, 0.7)",
  ];

  // Create or update chart
  const ctx = document.getElementById("resultsChart").getContext("2d");

  if (resultsChart) {
    resultsChart.data.labels = candidateNames;
    resultsChart.data.datasets[0].data = candidateVotes;
    resultsChart.update();
  } else {
    resultsChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: candidateNames,
        datasets: [
          {
            label: "Votes",
            data: candidateVotes,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map((c) => c.replace("0.7", "1")),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }
}
