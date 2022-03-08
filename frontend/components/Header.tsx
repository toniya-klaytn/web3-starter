import Link from 'next/link'
import { useState, useEffect, useContext } from 'react'
import WalletModal from './WalletModal'
import providerContext from '../context/context'
import Caver from 'caver-js'
import Web3 from 'web3'
import fs from 'fs'

const networks = ['Baobab', 'Cypress']

const Header = () => {
  const { klaytnProvider, ethProvider } = useContext(providerContext)
  const [walletModal, setWalletModal] = useState<boolean>(false)
  const [network, setNetwork] = useState<any>()
  const [metamaskBalance, setMetamaskBalace] = useState<string>()
  const [kaikasBalance, setKaikasBalance] = useState()

  const detectNetwork = () => {
    if (klaytnProvider) {
      const networkId = klaytnProvider.networkVersion
      if (networkId === 1001) {
        setNetwork('Baobab')
      } else if (networkId === 8217) {
        setNetwork('Cypress')
      }
    }
  }

  const changeNetwork = async (e: any) => {
    const selected = e.target.value
    setNetwork(selected)
    if (selected === 'Cypress') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2019' }],
        })
      } catch (err: any) {
        if (err.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x2019',
                  chainName: 'Klaytn Cypress',
                  rpcUrls: ['https://public-node-api.klaytnapi.com/v1/cypress'],
                },
              ],
            })
          } catch (addError) {
            console.error(addError)
          }
        }
      }
    } else if (selected === 'Baobab') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x3e9' }],
        })
      } catch (err: any) {
        if (err.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x3e9',
                  chainName: 'Klaytn Baobab',
                  rpcUrls: ['https://public-node-api.klaytnapi.com/v1/baobab'],
                },
              ],
            })
          } catch (addError) {
            console.error(addError)
          }
        }
      }
    }
  }

  const getMetamaskBalance = async () => {
    let web3 = new Web3(ethProvider)
    const account = await ethereum.request({ method: 'eth_accounts' })
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [account[0], 'latest'],
    })
    const wei = web3.utils.hexToNumberString(balance)
    const ether = web3.utils.fromWei(wei, 'ether')
    setMetamaskBalace(ether)
  }

  //   const getKaikasBalance = async () => {
  //     const caver = new Caver(klaytnProvider)
  //     const account = klaytnProvider.selectedAddress
  //     const balance = await caver.klay.getBalance(account)
  //     console.log('balance: ', balance)
  //   }

  useEffect(() => {
    if (ethProvider && klaytnProvider) {
      if (!network) {
        detectNetwork()
      }
      klaytnProvider.on('networkChanged', function () {
        detectNetwork()
      })
      getMetamaskBalance()
      // getKaikasBalance()
    }
  }, [ethProvider, klaytnProvider])

  return (
    <header className="grid grid-rows-2">
      <div className="flex place-content-between p-3 items-center text-gray-900 bg-gray-100">
        <WalletModal walletModal={walletModal} setWalletModal={setWalletModal} />
        <Link href="/">
          <a className="mx-10">Klaytn Kit</a>
        </Link>

        <ul className="flex items-right">
          <div className="flex justify-center items-center">
            <div className="mx-6">{metamaskBalance} KLAY</div>
            <div className="xl:w-84">
              <select
                className="form-select block w-full px-2 py-2 font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded-full transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:outline-none"
                aria-label="Default select example"
                value={network}
                onChange={changeNetwork}
              >
                {networks.map((env) => (
                  <option key={env}>{env}</option>
                ))}
              </select>
            </div>
            <li className="mx-8">
              <button
                className="rounded-full bg-blue-600 px-3 py-2 text-white"
                onClick={() => setWalletModal(true)}
              >
                Connect
              </button>
            </li>
          </div>
        </ul>
      </div>
      <div className="flex place-content-center items-center text-gray-900 bg-gray-100 shadow">
        <ul>
          <li className="mx-10 hover:text-blue-600 hover:underline hover:underline-offset-4 focus:bg-red-500 ">
            <Link href="/dashboard">
              <a>Dashboard</a>
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}

export default Header
