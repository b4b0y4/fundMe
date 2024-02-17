import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceSpan = document.querySelector(".balance")
const ethAmountInput = document.getElementById("ethAmount")

withdrawButton.onclick = withdraw
fundButton.onclick = fund

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
      await listenForTransactionMine(transactionResponse, provider)
      await getBalance()
      ethAmountInput.value = ""
    } catch (error) {
      console.log(error)
    }
  } else {
    fundButton.innerHTML = "Install a Wallet"
    setTimeout(() => {
      connectButton.innerHTML = "Connect Wallet"
    }, 2000)
  }
}

async function withdraw() {
    console.log(`Withdrawing...`)
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      try {
        const transactionResponse = await contract.Withdraw()
        await listenForTransactionMine(transactionResponse, provider)
        await getBalance()
      } catch (error) {
        console.log(error)
      }
    } else {
      withdrawButton.innerHTML = "Install a Wallet"
      setTimeout(() => {
        connectButton.innerHTML = "Connect Wallet"
      }, 2000)
    }
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

getBalance();