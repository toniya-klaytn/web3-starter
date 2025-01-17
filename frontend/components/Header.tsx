import Link from 'next/link'
import { useState, useEffect, useContext } from 'react'
import WalletModal from './WalletModal'
import providerContext from '../context/context'
import { SwitchHorizontalIcon, DocumentDuplicateIcon } from '@heroicons/react/outline'
import Subheader from './Subheader'
import Web3 from 'web3'
import Caver from 'caver-js'

const networks = ['Baobab', 'Cypress']

const Header = () => {
  const {
    web3,
    caver,
    klaytnProvider,
    ethProvider,
    metamaskAddress,
    kaikasAddress,
    currentWallet,
    setKaikasAddress,
    setMetamaskAddress,
  } = useContext(providerContext)
  const [walletModal, setWalletModal] = useState<boolean>(false)
  const [network, setNetwork] = useState<any>()
  const [metamaskBalance, setMetamaskBalace] = useState<string>()
  const [kaikasBalance, setKaikasBalance] = useState<any>()
  const [metamaskConnected, setMetamaskConnected] = useState<boolean>(false)

  const detectKaikasNetwork = () => {
    if (klaytnProvider) {
      const networkId = klaytnProvider.networkVersion
      if (networkId === 1001) {
        setNetwork('Baobab')
      } else if (networkId === 8217) {
        setNetwork('Cypress')
      }
    }
  }

  const changeMetamaskNetwork = async (e: any) => {
    const selected = e.target.value
    setNetwork(selected)
    if (selected === 'Cypress') {
      try {
        await ethProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2019' }],
        })
      } catch (err: any) {
        if (err.code === 4902) {
          try {
            await ethProvider.request({
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
        await ethProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x3e9' }],
        })
      } catch (err: any) {
        if (err.code === 4902) {
          try {
            await ethProvider.request({
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

  const initMetamaskWallet = async () => {
    const status = ethProvider.isConnected()
    setMetamaskConnected(status)
  }

  const getMetamaskBalance = async () => {
    const account = ethProvider.selectedAddress
    setMetamaskAddress(account)
    const balance = await web3.eth.getBalance(account)
    if (balance) {
      const ether = web3.utils.fromWei(balance, 'ether')
      setMetamaskBalace(ether)
    } else {
      console.log('no balance')
    }
  }

  const getKaikasBalance = async () => {
    const caver = new Caver(klaytnProvider)
    const account = klaytnProvider.selectedAddress
    setKaikasAddress(account)
    const balance = await caver.klay.getBalance(account)
    if (balance) {
      const klay = caver.utils.convertFromPeb(balance, 'KLAY')
      setKaikasBalance(klay)
    } else {
      console.log('no balance')
    }
  }

  const shortenAddress = (str: any) => {
    return str.substring(0, 6) + '...' + str.substring(str.length - 4)
  }

  const shortenBalance = (str: any) => {
    return Math.round(str * 10) / 10
  }

  useEffect(() => {
    if (ethProvider) {
      initMetamaskWallet()
    }
  }, [ethProvider, metamaskConnected])

  useEffect(() => {
    if (web3 && ethProvider) {
      getMetamaskBalance()
    }
  }, [web3, ethProvider])

  useEffect(() => {
    if (klaytnProvider && caver) {
      if (!network) {
        detectKaikasNetwork()
      }
      klaytnProvider.on('networkChanged', function () {
        detectKaikasNetwork()
      })
      getKaikasBalance()
    }
  }, [klaytnProvider, caver])

  return (
    <header className="grid grid-rows-2 font-light">
      <div className="flex place-content-between p-3 items-center text-gray-900 bg-gray-100">
        <WalletModal
          walletModal={walletModal}
          setWalletModal={setWalletModal}
          setMetamaskConnected={setMetamaskConnected}
        />
        <Link href="/">
          <a className="mx-10 text-xl">Klaytn Starter Kit</a>
        </Link>
        <ul className="flex items-right">
          <div className="flex justify-center items-center">
            <div className="mx-6 flex">
              {currentWallet === 'Kaikas' && kaikasBalance
                ? shortenBalance(kaikasBalance)
                : metamaskBalance && shortenBalance(metamaskBalance)}{' '}
              KLAY
              <Link href="/transfers">
                <SwitchHorizontalIcon className="w-5 h-5 ml-2 text-slate-700 cursor-pointer" />
              </Link>
            </div>
            <div className="xl:w-84">
              <select
                className="form-select block w-full px-2 py-2 font-light bg-white bg-clip-padding bg-no-repeat border border-grey rounded-full transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:outline-none"
                aria-label="Default select example"
                value={network}
                onChange={changeMetamaskNetwork}
              >
                {networks.map((env) => (
                  <option key={env}>{env}</option>
                ))}
              </select>
            </div>
            <li className="mx-6">
              {kaikasAddress && (
                <button
                  className="flex items-center text-gray-600 font-light space-x-4 active:text-emerald-400"
                  onClick={() => {
                    navigator.clipboard.writeText(kaikasAddress)
                  }}
                >
                  {shortenAddress(kaikasAddress)}
                  <DocumentDuplicateIcon
                    className="w-5 h-10 ml-2 cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(kaikasAddress)
                    }}
                  />
                </button>
              )}
              {metamaskAddress && (
                <button
                  className="flex items-center text-gray-600 font-light space-x-4 active:text-emerald-400"
                  onClick={() => {
                    navigator.clipboard.writeText(metamaskAddress)
                  }}
                >
                  {shortenAddress(metamaskAddress)}
                  <DocumentDuplicateIcon
                    className="w-5 h-10 ml-2 cursor-pointer active:text-emerald-400"
                    onClick={() => {
                      navigator.clipboard.writeText(metamaskAddress)
                    }}
                  />
                </button>
              )}
              {!metamaskAddress && !kaikasAddress && (
                <button
                  className="border rounded-full px-4 py-2 border-grey bg-white font-light"
                  onClick={() => setWalletModal(true)}
                >
                  Connect
                </button>
              )}
            </li>
          </div>
        </ul>
      </div>
      <Subheader />
    </header>
  )
}

export default Header
