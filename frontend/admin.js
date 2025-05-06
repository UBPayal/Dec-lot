// Elements
const connectWalletBtn = document.getElementById("connect-wallet");
const walletStatus = document.getElementById("wallet-status");
const adminSection = document.getElementById("admin-section");
const statusMessage = document.getElementById("status-message");
const triggerDrawBtn = document.getElementById("trigger-draw");
const distributePrizeBtn = document.getElementById("distribute-prize");
const resetLotteryBtn = document.getElementById("reset-lottery");
const ticketPriceEl = document.getElementById("ticket-price");
const participantsCountEl = document.getElementById("participants-count");
const prizePoolEl = document.getElementById("prize-pool");
const winnerEl = document.getElementById("winner");
const wheelCanvas = document.getElementById("lottery-wheel");

// Global variables
let provider, signer, contract, userAddress, adminAddress;
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
    y: "+=12.56", // Two full rotations (4π radians)
    duration: 2000,
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

      // Check if user is admin
      adminAddress = await contract.admin();
      if (userAddress.toLowerCase() !== adminAddress.toLowerCase()) {
        showStatus(statusMessage, "You are not the admin", true);
        return;
      }

      // Show admin section
      adminSection.classList.remove("hidden");

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

// Trigger Draw
triggerDrawBtn.addEventListener("click", async () => {
  triggerDrawBtn.disabled = true;
  triggerDrawBtn.textContent = "Drawing...";
  try {
    const tx = await contract.drawWinner();
    await tx.wait();
    showStatus(statusMessage, "Draw triggered successfully!");
    anime({
      targets: triggerDrawBtn,
      rotate: "1turn",
      duration: 1000,
      easing: "easeInOutQuad"
    });
    spinWheel(); // Spin the wheel on draw
    loadLotteryDetails(contract, { ticketPriceEl, participantsCountEl, prizePoolEl, winnerEl, statusMessage });
  } catch (error) {
    console.error("Error triggering draw:", error);
    showStatus(statusMessage, `Failed to trigger draw: ${error.message}`, true);
  } finally {
    triggerDrawBtn.disabled = false;
    triggerDrawBtn.textContent = "Trigger Draw";
  }
});

// Distribute Prize
distributePrizeBtn.addEventListener("click", async () => {
  distributePrizeBtn.disabled = true;
  distributePrizeBtn.textContent = "Distributing...";
  try {
    const tx = await contract.distributePrize();
    await tx.wait();
    showStatus(statusMessage, "Prize distributed successfully!");
    anime({
      targets: distributePrizeBtn,
      scale: [1, 1.2, 1],
      duration: 500,
      easing: "easeInOutQuad"
    });
    loadLotteryDetails(contract, { ticketPriceEl, participantsCountEl, prizePoolEl, winnerEl, statusMessage });
  } catch (error) {
    console.error("Error distributing prize:", error);
    showStatus(statusMessage, `Failed to distribute prize: ${error.message}`, true);
  } finally {
    distributePrizeBtn.disabled = false;
    distributePrizeBtn.textContent = "Distribute Prize";
  }
});

// Reset Lottery
resetLotteryBtn.addEventListener("click", async () => {
  resetLotteryBtn.disabled = true;
  resetLotteryBtn.textContent = "Resetting...";
  try {
    const tx = await contract.resetLottery();
    await tx.wait();
    showStatus(statusMessage, "Lottery reset successfully!");
    anime({
      targets: resetLotteryBtn,
      scale: [1, 1.2, 1],
      duration: 500,
      easing: "easeInOutQuad"
    });
    loadLotteryDetails(contract, { ticketPriceEl, participantsCountEl, prizePoolEl, winnerEl, statusMessage });
  } catch (error) {
    console.error("Error resetting lottery:", error);
    showStatus(statusMessage, `Failed to reset lottery: ${error.message}`, true);
  } finally {
    resetLotteryBtn.disabled = false;
    resetLotteryBtn.textContent = "Reset Lottery";
  }
});