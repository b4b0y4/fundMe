import { ethers } from "./ethers-5.6.esm.min.js"
import { networkConfigs } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const modal = document.getElementById('warningModal')
const modalButton = document.getElementById('modalButton')

connectButton.onclick = initiateConnectAttempt
modalButton.onclick = switchNetwork

// Change as needed
const currentNetwork = networkConfigs.sepolia

let initialConnectAttempted = false

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
                connectButton.innerHTML = "Connect Wallet"
            }
        } catch (error) {
            console.log(error)
        }
    } else {
        connectButton.innerHTML = "Install a Wallet"
        setTimeout(() => {
            connectButton.innerHTML = "Connect Wallet"
          }, 3000)
    }
}

async function checkNetwork() {
    const chainId = await ethereum.request({ method: 'eth_chainId' })
    if (chainId !== `0x${currentNetwork.chainId.toString(16)}`) {
        showModal()
    } else {
        modal.style.display = 'none'
    }
}

function displayTruncatedAddress(address) {
    if (!address) return
    const truncatedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    connectButton.innerHTML = truncatedAddress
}

async function displayENSName(account) {
    try {
      const mainnetProvider = new ethers.providers.JsonRpcProvider(networkConfigs.ethereum.rpcUrl)
      
      const ensName = await mainnetProvider.lookupAddress(account)
      
      if (ensName) {
        connectButton.innerHTML = ensName
      }
    } catch (error) {
      console.log("Error getting ENS name:", error)
    }
  }

function showModal() {
    modal.style.display = 'block'
}

async function switchNetwork() {
    try {
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${currentNetwork.chainId.toString(16)}` }]
        })
    } catch (error) {
        console.error("Error switching network:", error)
    }
}

// Event listener for changes in wallet accounts
ethereum.on("accountsChanged", async function(accounts) {
    if (accounts.length > 0) {
        const address = accounts[0]
        displayTruncatedAddress(address)
        displayENSName(address)
    } else {
        connectButton.innerHTML = "Connect Wallet"
    }
})
// Event listener for changes in wallet network
ethereum.on("chainChanged", async function(chainId) {
    if (chainId !== `0x${currentNetwork.chainId.toString(16)}`) {
        showModal()
    } else {
        modal.style.display = 'none'
    }
})

// Event listener to connect on page load if already connected
window.addEventListener('load', async () => {
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