// Elements
const connectWalletBtn = document.getElementById("connect-wallet");
const walletStatus = document.getElementById("wallet-status");
const userSection = document.getElementById("user-section");
const statusMessage = document.getElementById("status-message");
const buyTicketBtn = document.getElementById("buy-ticket");
const ticketPriceEl = document.getElementById("ticket-price");
const participantsCountEl = document.getElementById("participants-count");
const prizePoolEl = document.getElementById("prize-pool");
const winnerEl = document.getElementById("winner");
const wheelCanvas = document.getElementById("lottery-wheel");

// Global variables
let provider, signer, contract, userAddress;
let scene, camera, renderer, wheel;

// Initialize Three.js Wheel
function initWheel() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ canvas: wheelCanvas, alpha: true });
  renderer.setSize(300, 300);
  wheelCanvas.classList.remove("hidden");

  const geometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  wheel = new THREE.Mesh(geometry, material);
  scene.add(wheel);

  camera.position.z = 2;

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}

// Spin Wheel
function spinWheel() {
  anime({
    targets: wheel.rotation,
    y: "+=6.28", // One full rotation (2π radians)
    duration: 1000,
    easing: "easeInOutQuad"
  });
}

// Connect Wallet
connectWalletBtn.addEventListener("click", async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
      walletStatus.textContent = `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
      connectWalletBtn.classList.add("hidden");

      // Initialize contract
      contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Show user section
      userSection.classList.remove("hidden");

      // Initialize wheel
      initWheel();

      // Load lottery details
      loadLotteryDetails(contract, { ticketPriceEl, participantsCountEl, prizePoolEl, winnerEl, statusMessage });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      showStatus(statusMessage, `Failed to connect wallet: ${error.message}`, true);
    }
  } else {
    showStatus(statusMessage, "Please install MetaMask", true);
  }
});

// Buy Ticket
buyTicketBtn.addEventListener("click", async () => {
  buyTicketBtn.disabled = true;
  buyTicketBtn.textContent = "Processing...";
  try {
    const ticketPrice = await contract.ticketPrice();
    const tx = await contract.buyTicket({ value: ticketPrice });
    await tx.wait();
    showStatus(statusMessage, "Ticket purchased successfully!");
    anime({
      targets: buyTicketBtn,
      scale: [1, 1.2, 1],
      duration: 500,
      easing: "easeInOutQuad"
    });
    spinWheel(); // Spin the wheel on ticket purchase
    loadLotteryDetails(contract, { ticketPriceEl, participantsCountEl, prizePoolEl, winnerEl, statusMessage });
  } catch (error) {
    console.error("Error buying ticket:", error);
    showStatus(statusMessage, `Failed to buy ticket: ${error.message}`, true);
  } finally {
    buyTicketBtn.disabled = false;
    buyTicketBtn.textContent = "Buy Ticket";
  }
});