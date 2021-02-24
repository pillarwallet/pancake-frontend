import { useEffect, useState } from 'react'
import { useLottery } from 'hooks/useContract'
import { getLotteryStatus } from 'utils/lotteryUtils'
import useEtherspotWallet from 'hooks/useEtherspotWallet'

/**
 * Returns whether or not the current lottery has drawn numbers
 *
 * @return {Boolean}
 */
const useGetLotteryHasDrawn = () => {
  const [lotteryHasDrawn, setLotteryHasDrawn] = useState(true)
  const { account } = useEtherspotWallet()
  const lotteryContract = useLottery()

  useEffect(() => {
    if (account && lotteryContract) {
      const fetchLotteryStatus = async () => {
        const state = await getLotteryStatus(lotteryContract)
        setLotteryHasDrawn(state)
      }

      fetchLotteryStatus()
    }
  }, [account, lotteryContract])

  return lotteryHasDrawn
}

export default useGetLotteryHasDrawn
