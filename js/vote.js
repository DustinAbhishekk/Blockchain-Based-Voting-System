// Sample candidates data
const candidates = [
  {
    id: 1,
    name: "Alice Johnson",
    party: "Independent",
    image: "/images/candidate1.jpg",
  },
  {
    id: 2,
    name: "Bob Smith",
    party: "Tech Party",
    image: "/images/candidate2.jpg",
  },
  {
    id: 3,
    name: "Charlie Brown",
    party: "Future Party",
    image: "/images/candidate3.jpg",
  },
];

// App state
let web3;
let accounts = [];
let selectedCandidateId = null;
let currentStep = 1;

document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const connectWalletBtn = document.getElementById("connectWalletBtn");
  const walletStatus = document.getElementById("walletStatus");
  const walletAddress = document.getElementById("walletAddress");
  const votingWalletAddress = document.getElementById("votingWalletAddress");

  const walletStep = document.getElementById("walletStep");
  const authStep = document.getElementById("authStep");
  const votingStep = document.getElementById("votingStep");

  const backToWalletBtn = document.getElementById("backToWalletBtn");
  const backToAuthBtn = document.getElementById("backToAuthBtn");

  const verifyBtn = document.getElementById("verifyBtn");
  const submitVoteBtn = document.getElementById("submitVoteBtn");

  const confirmationModal = document.getElementById("confirmationModal");
  const cancelVoteBtn = document.getElementById("cancelVoteBtn");
  const confirmVoteBtn = document.getElementById("confirmVoteBtn");

  const voteSuccess = document.getElementById("voteSuccess");
  const alreadyVoted = document.getElementById("alreadyVoted");

  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const step3 = document.getElementById("step3");
  const progressBar = document.getElementById("progressBar");

  // Initialize
  checkWalletConnection();
  setupEventListeners();

  function setupEventListeners() {
    // Wallet connection
    connectWalletBtn.addEventListener("click", connectWallet);

    // Navigation
    backToWalletBtn.addEventListener("click", () => navigateToStep(1));
    backToAuthBtn.addEventListener("click", () => navigateToStep(2));

    // Voting
    verifyBtn.addEventListener("click", verifyVoter);
    submitVoteBtn.addEventListener("click", showConfirmationModal);
    cancelVoteBtn.addEventListener("click", () =>
      confirmationModal.classList.add("hidden")
    );
    confirmVoteBtn.addEventListener("click", submitVote);
  }

  async function checkWalletConnection() {
    if (window.ethereum) {
      try {
        accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          updateWalletStatus(accounts[0]);
          navigateToStep(2);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  }

  async function connectWallet() {
    if (window.ethereum) {
      try {
        accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        web3 = new Web3(window.ethereum);
        updateWalletStatus(accounts[0]);
        navigateToStep(2);

        // Listen for account changes
        window.ethereum.on("accountsChanged", (newAccounts) => {
          if (newAccounts.length === 0) {
            // Wallet disconnected
            navigateToStep(1);
          } else {
            // Account changed
            accounts = newAccounts;
            updateWalletStatus(accounts[0]);
            if (currentStep > 1) navigateToStep(2);
          }
        });
      } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet. Please try again.");
      }
    } else {
      alert(
        "Please install MetaMask or another Web3 wallet to use this application!"
      );
    }
  }

  function updateWalletStatus(address) {
    const shortenedAddress = `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
    walletAddress.textContent = shortenedAddress;
    walletStatus.classList.remove("hidden");
    walletStatus.firstElementChild.classList.remove("wallet-disconnected");
    walletStatus.firstElementChild.classList.add("wallet-connected");

    // Update in voting section
    votingWalletAddress.textContent = shortenedAddress;
  }

  function navigateToStep(step) {
    currentStep = step;

    // Update UI visibility
    walletStep.classList.toggle("hidden", step !== 1);
    authStep.classList.toggle("hidden", step !== 2);
    votingStep.classList.toggle("hidden", step !== 3);

    // Update progress indicator
    step1.classList.toggle("bg-blue-600", step >= 1);
    step1.classList.toggle("text-white", step >= 1);
    step1.classList.toggle("bg-gray-200", step < 1);
    step1.classList.toggle("text-gray-600", step < 1);

    step2.classList.toggle("bg-blue-600", step >= 2);
    step2.classList.toggle("text-white", step >= 2);
    step2.classList.toggle("bg-gray-200", step < 2);
    step2.classList.toggle("text-gray-600", step < 2);

    step3.classList.toggle("bg-blue-600", step >= 3);
    step3.classList.toggle("text-white", step >= 3);
    step3.classList.toggle("bg-gray-200", step < 3);
    step3.classList.toggle("text-gray-600", step < 3);

    // Update progress bar
    if (step === 1) progressBar.style.width = "0%";
    if (step === 2) progressBar.style.width = "50%";
    if (step === 3) progressBar.style.width = "100%";

    // Load candidates if we're going to step 3
    if (
      step === 3 &&
      document.getElementById("candidatesList").children.length === 0
    ) {
      renderCandidates();
    }
  }

  function verifyVoter() {
    const voterId = document.getElementById("voterId").value.trim();
    const voterPin = document.getElementById("voterPin").value.trim();

    if (!voterId || !voterPin) {
      alert("Please enter both Voter ID and PIN");
      return;
    }

    // Simulate verification (in a real app, this would check against blockchain)
    verifyBtn.disabled = true;
    verifyBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin mr-2"></i> Verifying...';

    setTimeout(() => {
      // Check if already voted (using localStorage for demo)
      const votedAddresses =
        JSON.parse(localStorage.getItem("votedAddresses")) || [];
      if (votedAddresses.includes(accounts[0])) {
        showAlreadyVoted();
      } else {
        navigateToStep(3);
      }

      verifyBtn.disabled = false;
      verifyBtn.innerHTML = "Verify Identity";
    }, 1500);
  }

  function renderCandidates() {
    const candidatesList = document.getElementById("candidatesList");
    candidatesList.innerHTML = "";

    candidates.forEach((candidate) => {
      const candidateEl = document.createElement("div");
      candidateEl.className =
        "flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors";
      candidateEl.innerHTML = `
                <input type="radio" name="candidate" id="candidate-${candidate.id}" value="${candidate.id}" 
                       class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-full">
                <label for="candidate-${candidate.id}" class="ml-4 flex items-center flex-1">
                    <img src="${candidate.image}" alt="${candidate.name}" class="h-12 w-12 rounded-full object-cover">
                    <div class="ml-4">
                        <span class="block font-medium text-gray-900">${candidate.name}</span>
                        <span class="block text-sm text-gray-500">${candidate.party}</span>
                    </div>
                </label>
            `;

      candidateEl.addEventListener("click", () => {
        document.getElementById(`candidate-${candidate.id}`).checked = true;
        selectCandidate(candidate.id);
      });

      candidatesList.appendChild(candidateEl);
    });

    // Add radio button change listeners
    document.querySelectorAll('input[name="candidate"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        selectCandidate(parseInt(e.target.value));
      });
    });
  }

  function selectCandidate(candidateId) {
    selectedCandidateId = candidateId;
    submitVoteBtn.disabled = false;
  }

  function showConfirmationModal() {
    if (!selectedCandidateId) return;

    const candidate = candidates.find((c) => c.id === selectedCandidateId);
    document.getElementById("selectedCandidateName").textContent =
      candidate.name;
    confirmationModal.classList.remove("hidden");
  }

  function submitVote() {
    confirmationModal.classList.add("hidden");

    // Simulate blockchain transaction (in a real app, this would interact with your smart contract)
    submitVoteBtn.disabled = true;
    submitVoteBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';

    setTimeout(() => {
      // Record the vote (using localStorage for demo)
      const votedAddresses =
        JSON.parse(localStorage.getItem("votedAddresses")) || [];
      votedAddresses.push(accounts[0]);
      localStorage.setItem("votedAddresses", JSON.stringify(votedAddresses));

      const votes = JSON.parse(localStorage.getItem("votes")) || {};
      votes[selectedCandidateId] = (votes[selectedCandidateId] || 0) + 1;
      localStorage.setItem("votes", JSON.stringify(votes));

      // Generate fake tx hash for demo
      document.getElementById("txHash").textContent =
        "0x" +
        Math.random().toString(16).substr(2, 12) +
        "..." +
        Math.random().toString(16).substr(2, 4);

      // Show success
      votingStep.classList.add("hidden");
      voteSuccess.classList.remove("hidden");

      submitVoteBtn.disabled = false;
      submitVoteBtn.innerHTML = "Submit Vote";
    }, 2000);
  }

  function showAlreadyVoted() {
    authStep.classList.add("hidden");
    alreadyVoted.classList.remove("hidden");
  }
});
