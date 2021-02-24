import React, { useCallback, useContext, useMemo, useState } from 'react'
import {
  Sdk as EtherspotSdk,
  NetworkNames as EtherspotNetworkNames,
  MetaMaskWalletProvider,
  SessionStorage,
  StoredSession,
  EnvNames,
} from 'etherspot'

class LocalSessionStorage extends SessionStorage {
  setSession = async (walletAddress: string, session: StoredSession) => {
    if (walletAddress) {
      localStorage.setItem(`@session:${walletAddress}`, JSON.stringify(session))
    }
  }

  getSession = (walletAddress: string) => {
    let result = null

    try {
      const raw = localStorage.getItem(`@session:${walletAddress}`)
      result = JSON.parse(raw) || null
      result.expireAt = new Date(result.expireAt) // map back to expected
    } catch (err) {
      //
    }

    return result
  }
}

export const EtherspotContext = React.createContext(null)

let etherspotWalletProvider
let etherspotSdk

export const EtherspotContextProvider = ({ children }) => {
  const etherspotContext = useContext(EtherspotContext)

  if (etherspotContext !== null) {
    throw new Error('<EtherspotContextProvider /> has already been declared.')
  }

  const [account, setAccount] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [etherspotConnector, setEtherspotConnector] = useState(null)

  const connect = useCallback(
    (connectorId) => {
      if (isConnecting || !connectorId || !MetaMaskWalletProvider.detect() || connectorId === etherspotConnector) {
        return
      }

      setIsConnecting(true)

      MetaMaskWalletProvider.connect()
        .then((provider) => {
          etherspotWalletProvider = provider
          setEtherspotConnector(connectorId)
          setIsConnecting(false)

          etherspotSdk = new EtherspotSdk(etherspotWalletProvider, {
            networkName: EtherspotNetworkNames.Bsc,
            env: EnvNames.MainNets,
            sessionStorage: new LocalSessionStorage(),
            omitWalletProviderNetworkCheck: true,
          })

          etherspotSdk.computeContractAccount({ sync: true }).then(({ address }) => setAccount(address))
        })
        .catch((err) => {
          console.error('Etherspot MetaMaskWalletProvider error:', err)
          setEtherspotConnector(null)
          setIsConnecting(false)
        })
    },
    [isConnecting, etherspotConnector],
  )

  const reset = useCallback(() => {
    setEtherspotConnector(null)
    etherspotWalletProvider = null
    if (etherspotSdk) {
      etherspotSdk.destroy()
      etherspotSdk = null
    }
  }, [])

  const etherspot = useMemo(
    () => ({
      sdk: etherspotSdk,
      ethereum: etherspotWalletProvider?.ethereum,
      account,
      reset,
      connect,
    }),
    [account, reset, connect],
  )

  return <EtherspotContext.Provider value={{ etherspot }}>{children}</EtherspotContext.Provider>
}
