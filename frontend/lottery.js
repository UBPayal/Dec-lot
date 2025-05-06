// Contract address and ABI
const contractAddress = "0x5E34Cf7BFf346Ae078EbC431dC89EE7D2cc7c717";
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_ticketPrice",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "buyTicket",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "distributePrize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "drawWinner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getParticipants",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPrizePool",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isDrawDone",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "participants",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetLottery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ticketPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "winner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
 // TODO: Paste the ABI from lottery-abi.json here

// Show status message with AnimeJS
function showStatus(statusMessageEl, message, isError = false) {
  statusMessageEl.textContent = message;
  statusMessageEl.classList.remove("hidden", "text-green-600", "text-red-600");
  statusMessageEl.classList.add(isError ? "text-red-600" : "text-green-600");
  anime({
    targets: statusMessageEl,
    opacity: [0, 1],
    duration: 500,
    easing: "easeInOutQuad",
    complete: () => setTimeout(() => {
      anime({ targets: statusMessageEl, opacity: 0, duration: 500 });
    }, 2000)
  });
}

// Load lottery details
async function loadLotteryDetails(contract, elements) {
  try {
    const ticketPrice = await contract.ticketPrice();
    const participants = await contract.getParticipants();
    const prizePool = await contract.getPrizePool();
    const winner = await contract.winner();

    elements.ticketPriceEl.textContent = ethers.utils.formatEther(ticketPrice);
    elements.participantsCountEl.textContent = participants.length;
    elements.prizePoolEl.textContent = ethers.utils.formatEther(prizePool);
    elements.winnerEl.textContent = winner === "0x0000000000000000000000000000000000000000" ? "Not drawn yet" : winner;
  } catch (error) {
    console.error("Error loading lottery details:", error);
    showStatus(elements.statusMessageEl, "Failed to load lottery details", true);
  }
}