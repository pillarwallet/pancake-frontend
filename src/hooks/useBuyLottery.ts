import { useCallback, useState, useEffect } from 'react'
import { useLottery, useLotteryTicket } from 'hooks/useContract'
import useEtherspotWallet from 'hooks/useEtherspotWallet'
import { multiClaim, getMax, multiBuy } from '../utils/lotteryUtils'

export const useMultiClaimLottery = () => {
  const { account } = useEtherspotWallet()
  const lotteryContract = useLottery()
  const lotteryTicketContract = useLotteryTicket()

  const handleClaim = useCallback(async () => {
    try {
      const txHash = await multiClaim(lotteryContract, lotteryTicketContract, account)
      return txHash
    } catch (e) {
      return false
    }
  }, [account, lotteryContract, lotteryTicketContract])

  return { onMultiClaim: handleClaim }
}

export const useMultiBuyLottery = () => {
  const { account } = useEtherspotWallet()
  const lotteryContract = useLottery()

  const handleBuy = useCallback(
    async (amount: string, numbers: Array<any>) => {
      try {
        const txHash = await multiBuy(lotteryContract, amount, numbers, account)
        return txHash
      } catch (e) {
        return false
      }
    },
    [account, lotteryContract],
  )

  return { onMultiBuy: handleBuy }
}

export const useMaxNumber = () => {
  const [max, setMax] = useState(5)
  const lotteryContract = useLottery()

  const fetchMax = useCallback(async () => {
    const maxNumber = await getMax(lotteryContract)
    setMax(maxNumber)
  }, [lotteryContract])

  useEffect(() => {
    if (lotteryContract) {
      fetchMax()
    }
  }, [lotteryContract, fetchMax])

  return max
}
