// Sample candidates data
const candidates = [
    { id: 1, name: "Alice Johnson", party: "Independent", image: "../images/candidate1.jpg" },
    { id: 2, name: "Bob Smith", party: "Tech Party", image: "../images/candidate2.jpg" },
    { id: 3, name: "Charlie Brown", party: "Future Party", image: "../images/candidate3.jpg" }
];

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const authForm = document.getElementById('auth-form');
    const authSection = document.getElementById('auth-section');
    const votingSection = document.getElementById('voting-section');
    const candidatesList = document.getElementById('candidates-list');
    const submitVoteBtn = document.getElementById('submit-vote');
    const backToAuthBtn = document.getElementById('back-to-auth');
    const voteFeedback = document.getElementById('vote-feedback');
    
    // App state
    let selectedCandidateId = null;
    let votedIds = JSON.parse(localStorage.getItem('votedIds')) || [];

    // Initialize
    renderCandidates();
    setupEventListeners();

    function setupEventListeners() {
        authForm.addEventListener('submit', handleAuthSubmit);
        backToAuthBtn.addEventListener('click', goBackToAuth);
        submitVoteBtn.addEventListener('click', handleVoteSubmit);
    }

    function renderCandidates() {
        candidatesList.innerHTML = '';
        
        candidates.forEach(candidate => {
            const candidateEl = document.createElement('div');
            candidateEl.className = 'flex items-center p-3 border border-gray-300 border-opacity-30 rounded-lg hover:bg-white hover:bg-opacity-5 cursor-pointer';
            candidateEl.innerHTML = `
                <input type="radio" name="candidate" id="candidate-${candidate.id}" value="${candidate.id}" 
                       class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                <label for="candidate-${candidate.id}" class="ml-3 flex items-center">
                    <img src="${candidate.image}" alt="${candidate.name}" class="h-10 w-10 rounded-full object-cover">
                    <div class="ml-3">
                        <span class="block text-sm font-medium">${candidate.name}</span>
                        <span class="block text-xs opacity-70">${candidate.party}</span>
                    </div>
                </label>
            `;
            
            // Add click handler
            candidateEl.addEventListener('click', () => {
                document.getElementById(`candidate-${candidate.id}`).checked = true;
                selectCandidate(candidate.id);
            });
            
            candidatesList.appendChild(candidateEl);
        });
        
        // Add radio button change listeners
        document.querySelectorAll('input[name="candidate"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                selectCandidate(parseInt(e.target.value));
            });
        });
    }

    function selectCandidate(candidateId) {
        selectedCandidateId = candidateId;
        submitVoteBtn.disabled = false;
    }

    function handleAuthSubmit(e) {
        e.preventDefault();
        
        const voterId = document.getElementById('voter-id').value.trim();
        const voterPin = document.getElementById('voter-pin').value.trim();
        
        if (!voterId || !voterPin) {
            alert('Please enter both Voter ID and PIN');
            return;
        }
        
        // Check if already voted
        if (votedIds.includes(voterId)) {
            alert('This Voter ID has already cast a vote.');
            return;
        }
        
        // Simulate authentication
        const submitBtn = authForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Authenticating...';
        
        setTimeout(() => {
            authSection.classList.add('hidden');
            votingSection.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Authenticate';
        }, 1000);
    }

    function handleVoteSubmit() {
        if (!selectedCandidateId) return;
        
        const voterId = document.getElementById('voter-id').value.trim();
        
        submitVoteBtn.disabled = true;
        submitVoteBtn.innerHTML = 'Processing Vote...';
        
        // Simulate blockchain transaction
        setTimeout(() => {
            // Record the vote
            votedIds.push(voterId);
            localStorage.setItem('votedIds', JSON.stringify(votedIds));
            
            // Update vote counts
            const votes = JSON.parse(localStorage.getItem('votes')) || {};
            votes[selectedCandidateId] = (votes[selectedCandidateId] || 0) + 1;
            localStorage.setItem('votes', JSON.stringify(votes));
            
            // Show success
            votingSection.classList.add('hidden');
            voteFeedback.classList.remove('hidden');
            
            // Generate fake tx hash
            document.getElementById('tx-hash').textContent = '0x' + Math.random().toString(16).substr(2, 12) + '...' + Math.random().toString(16).substr(2, 4);
        }, 1500);
    }

    function goBackToAuth() {
        votingSection.classList.add('hidden');
        authSection.classList.remove('hidden');
        selectedCandidateId = null;
        submitVoteBtn.disabled = true;
    }
});