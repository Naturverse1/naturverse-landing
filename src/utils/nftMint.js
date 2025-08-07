
import { ethers } from 'ethers'

const contractAddress = process.env.VITE_CONTRACT_ADDRESS || "0x742d35Cc6634C0532925a3b8D0C8C8a5C3c3a3B6"

// Basic ERC-721 ABI for minting
const abi = [
  "function mint(address to, string memory tokenURI) public returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)"
]

export async function mintNFT(account, metadataURI) {
  try {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask to mint NFTs')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    
    // Estimate gas for the transaction
    const gasEstimate = await contract.mint.estimateGas(account, metadataURI)
    
    // Execute the mint transaction
    const tx = await contract.mint(account, metadataURI, {
      gasLimit: gasEstimate
    })
    
    const receipt = await tx.wait()
    const tokenId = await contract.totalSupply()
    
    return {
      success: true,
      transactionHash: receipt.hash,
      tokenId: tokenId.toString(),
      blockNumber: receipt.blockNumber
    }
  } catch (error) {
    console.error('NFT minting error:', error)
    throw new Error(`Failed to mint NFT: ${error.message}`)
  }
}

export async function getTokenMetadata(tokenId) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(contractAddress, abi, provider)
    const tokenURI = await contract.tokenURI(tokenId)
    
    // Fetch metadata from URI
    const response = await fetch(tokenURI)
    const metadata = await response.json()
    
    return metadata
  } catch (error) {
    console.error('Error fetching token metadata:', error)
    return null
  }
}
