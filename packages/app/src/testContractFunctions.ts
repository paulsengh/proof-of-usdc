const { ethers } = require("ethers");
const { abi } = require("./ProofOfUSDC");

const contractAddress = "0xaC60F7C6F55dCCbFc9c9149f69805A88F5Adf3ed"; // Replace with your contract address

const testContractFunctions = async () => {
  try {
    // Use the default provider or set up a custom provider
    const provider = ethers.getDefaultProvider(); // You can customize this if needed
    console.log("Provider set up:", provider);

    const contract = new ethers.Contract(contractAddress, abi, provider);
    console.log("Contract instance created:", contract);

    // Log the contract address and ABI to ensure they are correct
    console.log("Contract Address:", contractAddress);
    console.log("Contract ABI:", abi);

    // Test the totalSupply function
    const totalSupply = await contract.totalSupply();
    console.log("Total Supply:", totalSupply.toString());

    // Test other functions
    const name = await contract.name();
    console.log("Contract Name:", name);

    const symbol = await contract.symbol();
    console.log("Contract Symbol:", symbol);
  } catch (error) {
    console.error("Error testing contract functions:", error);
  }
};

testContractFunctions();
