// Chart instance
let publicResultsChart = null;

// Sample candidates data (same as in vote.html)
const candidates = [
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

// DOM elements
const refreshResultsBtn = document.getElementById("refreshResultsBtn");
const resultsTableBody = document.getElementById("resultsTableBody");
const resultsTotalVotes = document.getElementById("resultsTotalVotes");
const resultsVotingStatus = document.getElementById("resultsVotingStatus");
const lastUpdated = document.getElementById("lastUpdated");

// Update results
function updateResults() {
  const votes = JSON.parse(localStorage.getItem("votes")) || {};
  const voteCounts = {};

  // Count votes per candidate
  Object.values(votes).forEach((candidateId) => {
    voteCounts[candidateId] = (voteCounts[candidateId] || 0) + 1;
  });

  // Update summary
  resultsTotalVotes.textContent = Object.keys(votes).length;
  lastUpdated.textContent = new Date().toLocaleTimeString();

  // Prepare data for chart
  const candidateNames = candidates.map((c) => c.name);
  const candidateVotes = candidates.map((c) => voteCounts[c.id] || 0);
  const totalVotes = Object.keys(votes).length;
  const backgroundColors = [
    "rgba(59, 130, 246, 0.7)",
    "rgba(168, 85, 247, 0.7)",
    "rgba(16, 185, 129, 0.7)",
    "rgba(245, 158, 11, 0.7)",
    "rgba(239, 68, 68, 0.7)",
    "rgba(20, 184, 166, 0.7)",
  ];

  // Create or update chart
  const ctx = document.getElementById("publicResultsChart").getContext("2d");

  if (publicResultsChart) {
    publicResultsChart.data.labels = candidateNames;
    publicResultsChart.data.datasets[0].data = candidateVotes;
    publicResultsChart.update();
  } else {
    publicResultsChart = new Chart(ctx, {
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
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw;
                const percentage =
                  totalVotes > 0 ? Math.round((value / totalVotes) * 100) : 0;
                return `${value} votes (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  // Update results table
  resultsTableBody.innerHTML = "";

  candidates.forEach((candidate) => {
    const votes = voteCounts[candidate.id] || 0;
    const percentage =
      totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;

    const row = document.createElement("tr");
    row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                                <img class="h-10 w-10 rounded-full" src="${candidate.image}" alt="${candidate.name}">
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${candidate.name}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${candidate.party}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${votes}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${percentage}%</div>
                    </td>
                `;

    resultsTableBody.appendChild(row);
  });
}

// Event listeners
refreshResultsBtn.addEventListener("click", updateResults);

// Initialize
updateResults();

// Check voting status (same as in vote.html)
function updateVotingStatus() {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 2); // 2 days from now

  const now = new Date();
  const diff = endDate - now;

  if (diff <= 0) {
    resultsVotingStatus.textContent = "Closed";
    return;
  }

  resultsVotingStatus.textContent = "Open";
}

updateVotingStatus();
