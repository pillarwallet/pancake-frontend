import { useContext } from 'react'
import { EtherspotContext } from 'contexts/EtherspotContext'

const useEtherspotWallet = () => {
  const etherspotContext = useContext(EtherspotContext)

  if (etherspotContext === null) {
    throw new Error(
      'useEtherspotWallet() can only be used inside of <EtherspotContextProvider />, ' +
        'please declare it at a higher level.',
    )
  }

  const { etherspot } = etherspotContext

  return { ...etherspot }
}

export default useEtherspotWallet
