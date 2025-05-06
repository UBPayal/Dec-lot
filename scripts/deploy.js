const { ethers } = require("hardhat");

async function main() {
  console.log("Starting optimized deployment process...");

  // Get signer and wallet address
  console.log("Fetching signer...");
  const [signer] = await ethers.getSigners();
  const walletAddress = await signer.getAddress();
  console.log("Deploying from wallet:", walletAddress);

  // Check wallet balance
  console.log("Checking wallet balance...");
  const balance = await ethers.provider.getBalance(walletAddress);
  console.log("Wallet balance:", ethers.formatEther(balance), "ETH");

  // Set ticket price
  const ticketPrice = ethers.parseEther("0.0001");
  console.log("Ticket price:", ethers.formatEther(ticketPrice), "ETH");

  // Get current gas prices from the network
  console.log("Getting current gas prices...");
  const feeData = await ethers.provider.getFeeData();
  
  // Set gas price 20% higher than current average to ensure quick processing
  const currentGasPrice = feeData.gasPrice;
  const gasPrice = currentGasPrice * 120n / 100n; // 1.2x current gas price
  
  // For Sepolia, we use standard gas pricing instead of EIP-1559
  console.log("Current network gas price:", ethers.formatUnits(currentGasPrice || 0n, "gwei"), "gwei");
  console.log("Using gas price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");

  // Configure gas limit
  const gasLimit = 1000000n; // Slightly higher than before
  const gasCost = gasLimit * gasPrice;
  console.log("Gas limit:", gasLimit.toString());
  console.log("Estimated gas cost:", ethers.formatEther(gasCost), "ETH");

  // Check if wallet has sufficient funds
  if (balance < gasCost) {
    console.error(
      "Insufficient funds: have",
      ethers.formatEther(balance),
      "ETH, need",
      ethers.formatEther(gasCost),
      "ETH"
    );
    process.exit(1);
  }

  // Print current nonce for transparency
  const currentNonce = await ethers.provider.getTransactionCount(walletAddress);
  console.log("Current account nonce:", currentNonce);

  // Deploy contract
  console.log("Getting Lottery contract factory...");
  const Lottery = await ethers.getContractFactory("Lottery");
  console.log("Deploying Lottery contract...");
  try {
    // Deploy with optimized parameters
    const lottery = await Lottery.deploy(
      ticketPrice,
      {
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        nonce: currentNonce // Explicitly set nonce
      }
    );
    
    console.log("Transaction sent, hash:", lottery.deploymentTransaction().hash);
    console.log("Waiting for transaction confirmation...");
    console.log("(This could take a few minutes on Sepolia)");
    
    // Log progress during deployment
    let dots = "";
    const waitInterval = setInterval(() => {
      process.stdout.write(".");
      dots += ".";
      if (dots.length > 60) {
        process.stdout.write("\n");
        dots = "";
      }
    }, 3000);
    
    // Wait for deployment with timeout
    const deployedContract = await lottery.waitForDeployment();
    clearInterval(waitInterval);
    
    const contractAddress = await deployedContract.getAddress();
    console.log("\nLottery successfully deployed to:", contractAddress);
    
    // Verify the contract deployment
    console.log("Verifying contract has code...");
    const code = await ethers.provider.getCode(contractAddress);
    if (code === '0x' || code === '0x0') {
      console.log("Warning: No contract code found at address. Deployment may have failed.");
    } else {
      console.log("Contract verified - code exists at deployed address ✓");
      console.log("\nDeployment successful! Your lottery contract is ready to use.");
      console.log("View on Etherscan: https://sepolia.etherscan.io/address/" + contractAddress);
    }
  } catch (error) {
    console.error("\nFailed to deploy contract:", error.message);
    
    if (error.message.includes("timeout")) {
      console.log("\nThe transaction was sent but confirmation timed out.");
      console.log("Your contract might still be deployed. Check your address on Etherscan:");
      console.log("https://sepolia.etherscan.io/address/" + walletAddress);
    }
    
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Deployment failed:", e.message);
  process.exit(1);
});
//Lottery deployed to: 0x5E34Cf7BFf346Ae078EbC431dC89EE7D2cc7c717

// const { ethers } = require("hardhat");
// const Lottery = await ethers.getContractFactory("Lottery");
// const lottery = await Lottery.attach("0x32d223928c3f8b66C0996013BB81B05Eb25Ad11e");
// await lottery.ticketPrice();
// await (await lottery.buyTicket({ value: ethers.parseEther("0.01") })).wait();
// await lottery.getParticipants();


// PS D:\Projects\decentralized-lottery> npx hardhat console --network sepolia
// Welcome to Node.js v20.18.0.
// Type ".help" for more information.
// > const { ethers } = require("hardhat");
// undefined
// > const Lottery = await ethers.getContractFactory("Lottery");
// undefined
// > const lottery = await Lottery.attach("0x32d223928c3f8b66C0996013BB81B05Eb25Ad11e");
// undefined
// > await lottery.ticketPrice();
// 10000000000000000n
// > await (await lottery.buyTicket({ value: ethers.parseEther("0.01") })).wait();

// ContractTransactionReceipt {
//   provider: HardhatEthersProvider {
//     _hardhatProvider: LazyInitializationProviderAdapter {
//       _providerFactory: [AsyncFunction (anonymous)],
//       _emitter: [EventEmitter],
//       _initializingPromise: [Promise],
//       provider: [BackwardsCompatibilityProviderAdapter]
//     },
//     _networkName: 'sepolia',
//     _blockListeners: [],
//     _transactionHashListeners: Map(0) {},
//     _eventListeners: [],
//     _isHardhatNetworkCached: false,
//     _transactionHashPollingTimeout: undefined
//   },
//   to: '0x32d223928c3f8b66C0996013BB81B05Eb25Ad11e',
//   from: '0xB0250A9AE5Df63697973C4B9f7712872147a41b3',
//   contractAddress: null,
//   hash: '0x3f1bb9c394eeb11c6edc5108fcfc46efe535a14653197a11078c51387b5d148f',  
//   index: 75,
//   blockHash: '0x676d32f7e984fc1824d87d4da6d9582ee46a710926d2dafd64b796bf375efd0c',
//   blockNumber: 8192872,
//   logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
//   gasUsed: 69928n,
//   blobGasUsed: undefined,
//   cumulativeGasUsed: 8645034n,
//   gasPrice: 50748895179n,
//   blobGasPrice: undefined,
//   type: 2,
//   status: 1,
//   root: undefined
// }
// > await (await lottery.buyTicket({ value: ethers.parseEther("0.01") })).wait();

// ContractTransactionReceipt {
//   provider: HardhatEthersProvider {
//     _hardhatProvider: LazyInitializationProviderAdapter {
//       _providerFactory: [AsyncFunction (anonymous)],
//       _emitter: [EventEmitter],
//       _initializingPromise: [Promise],
//       provider: [BackwardsCompatibilityProviderAdapter]
//     },
//     _networkName: 'sepolia',
//     _blockListeners: [],
//     _transactionHashListeners: Map(0) {},
//     _eventListeners: [],
//     _isHardhatNetworkCached: false,
//     _transactionHashPollingTimeout: undefined
//   },
//   to: '0x32d223928c3f8b66C0996013BB81B05Eb25Ad11e',
//   from: '0xB0250A9AE5Df63697973C4B9f7712872147a41b3',
//   contractAddress: null,
//   hash: '0x9e54ee1b82164f7a45f1588e98d2f6c24ef5cf640734e954f309be05215cd080',  
//   index: 62,
//   blockHash: '0xb8bdc89e94eab7d679a6a2a7560ce63474e5121bbb3ec580588cee2a86b860ac',
//   blockNumber: 8192874,
//   logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
//   gasUsed: 52828n,
//   blobGasUsed: undefined,
//   cumulativeGasUsed: 9162021n,
//   gasPrice: 52093647614n,
//   blobGasPrice: undefined,
//   type: 2,
//   status: 1,
//   root: undefined
// }
// > await lottery.getParticipants();
// Result(2) [
//   '0xB0250A9AE5Df63697973C4B9f7712872147a41b3',
//   '0xB0250A9AE5Df63697973C4B9f7712872147a41b3'
// ]
// >