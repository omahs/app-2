import {BigNumber, constants} from 'ethers';
import {useCallback, useEffect, useState} from 'react';

import {useNetwork} from 'context/network';
import {fetchTokenPrice} from 'services/prices';

/**
 * Poll for gas fee on given interval
 * @param estimateFunc function to run to estimate gas
 * @param pollingInterval gas fee polling interval
 * @param shouldPoll whether polling should be started/continued
 * @returns native token pricing, gas fee and elapsed time since last poll
 */
const usePollGasFee = (
  estimateFunc: () => Promise<BigNumber> | undefined,
  pollingInterval = 30,
  shouldPoll = true
) => {
  const {network} = useNetwork();
  const [fee, setFee] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [pauseInterval, setPauseInterval] = useState(true);

  useEffect(() => {
    async function poll() {
      try {
        // seconds at zero, pause counter and get gas fee
        setPauseInterval(true);

        // fetch gas fee and native token price
        const results = await Promise.all([
          estimateFunc(),
          fetchTokenPrice(constants.AddressZero, network),
        ]);

        // set gas fee and price
        setFee(results[0]?.toNumber() || 0);
        setPrice(results[1] || 0);

        // restart interval
        setPauseInterval(false);
      } catch (error) {
        console.error(error);
      }
    }

    // run only when modal is shown
    if (shouldPoll && seconds === 0) {
      poll();
    }
  }, [seconds, network, shouldPoll, estimateFunc]);

  useEffect(() => {
    // run seconds counter when the modal is shown and transaction waiting to
    // be confirmed
    if (shouldPoll) {
      const interval = setInterval(() => {
        if (!pauseInterval) {
          // update seconds counter and reset to zero when it gets to 10
          setSeconds(prevSecs =>
            prevSecs !== pollingInterval ? prevSecs + 1 : 0
          );
        }
      }, 1000);

      // clear interval on unmount
      return () => clearInterval(interval);
    }
  }, [pauseInterval, pollingInterval, shouldPoll]);

  const stopPolling = useCallback(() => {
    setFee(0);
    setPrice(0);
    setSeconds(0);
    setPauseInterval(true);
  }, []);

  return {
    /** estimated gas fee in Wei */
    gasFee: fee,
    /** USD price of native token unit */
    nativeTokenPrice: price,
    /** time elapsed since last estimation */
    elapsedTime: seconds,
    /** stop gas fee estimation polling */
    stopPolling,
  };
};

export default usePollGasFee;
