import { ethers } from "./ethers-5.6.esm.min.js"
import { networkConfigs, abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const modal = document.getElementById("warningModal")
const modalButton = document.getElementById("modalButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceSpan = document.querySelector(".balance")
const ethAmountInput = document.getElementById("ethAmount")

connectButton.onclick = initiateConnectAttempt
modalButton.onclick = switchNetwork
withdrawButton.onclick = withdraw
fundButton.onclick = fund

// Change as needed
const currentNetwork = networkConfigs.sepolia

let initialConnectAttempted = false

// CONNECTION
async function initiateConnectAttempt() {
  if (!initialConnectAttempted) {
    initialConnectAttempted = true
    try {
      await ethereum.request({ method: "eth_requestAccounts" })
      await checkNetwork()
      const accounts = await ethereum.request({ method: "eth_accounts" })
      if (accounts.length > 0) {
        const address = accounts[0]
        displayTruncatedAddress(address)
        displayENSName(address)
      } else {
        connectButton.innerHTML = "Connect"
      }
    } catch (error) {
      console.log(error)
    }
  } else {
    connectButton.innerHTML = "Install a Wallet"
    setTimeout(() => {
      connectButton.innerHTML = "Connect"
    }, 3000)
  }
}

async function checkNetwork() {
  const chainId = await ethereum.request({ method: "eth_chainId" })
  if (chainId !== `0x${currentNetwork.chainId.toString(16)}`) {
    showModal()
  } else {
    modal.style.display = "none"
  }
}

function displayTruncatedAddress(address) {
  if (!address) return
  const truncatedAddress = `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`
  connectButton.innerHTML = truncatedAddress
}

async function displayENSName(account) {
  try {
    const mainnetProvider = new ethers.providers.JsonRpcProvider(
      networkConfigs.ethereum.rpcUrl
    )

    const ensName = await mainnetProvider.lookupAddress(account)

    if (ensName) {
      connectButton.innerHTML = ensName
    }
  } catch (error) {
    console.log("Error getting ENS name:", error)
  }
}

function showModal() {
  modal.style.display = "block"
}

async function switchNetwork() {
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${currentNetwork.chainId.toString(16)}` }],
    })
  } catch (error) {
    console.error("Error switching network:", error)
  }
}

// Event listener for changes in wallet accounts
ethereum.on("accountsChanged", async function (accounts) {
  if (accounts.length > 0) {
    const address = accounts[0]
    displayTruncatedAddress(address)
    displayENSName(address)
  } else {
    connectButton.innerHTML = "Connect"
  }
})
// Event listener for changes in wallet network
ethereum.on("chainChanged", async function (chainId) {
  if (chainId !== `0x${currentNetwork.chainId.toString(16)}`) {
    showModal()
  } else {
    modal.style.display = "none"
  }
})

// Event listener to connect on page load if already connected
window.addEventListener("load", async () => {
  try {
    const accounts = await ethereum.request({ method: "eth_accounts" })
    if (accounts.length > 0) {
      const address = accounts[0]
      displayTruncatedAddress(address)
      displayENSName(address)
    }
  } catch (error) {
    console.log(error)
  }
})

// OTHER FUNCTIONS
async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    try {
      const balance = await provider.getBalance(contractAddress)
      balanceSpan.innerHTML = ethers.utils.formatEther(balance)
    } catch (error) {
      console.log(error)
    }
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount}...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      fundButton.innerHTML = "Funding..."
      await listenForTransactionMine(transactionResponse, provider)
      await getBalance()
      ethAmountInput.value = ""
    } catch (error) {
      console.log(error)
      fundButton.innerHTML = "More!"
    }
  } else {
    fundButton.innerHTML = "Install a Wallet"
  }
  setTimeout(() => {
    fundButton.innerHTML = "Fund"
  }, 2000)
}

async function withdraw() {
  console.log(`Withdrawing...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.withdraw()
      withdrawButton.innerHTML = "Withdrawing..."
      await listenForTransactionMine(transactionResponse, provider)
      await getBalance()
    } catch (error) {
      console.log(error)
      withdrawButton.innerHTML = "Not the Owner!"
    }
  } else {
    withdrawButton.innerHTML = "Install a Wallet"
  }
  setTimeout(() => {
    withdrawButton.innerHTML = "Withdraw"
  }, 2000)
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`)
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations. `
      )
      resolve()
    })
  })
}

document.addEventListener("DOMContentLoaded", () => {
  getBalance()
})
