import { Web3Provider } from "@ethersproject/providers"
import { ethers } from "ethers"
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { useSigner } from "use-signer"
import { useCache } from "./useCache"
import { ClientDaoERC20Voting, Context as SdkContext } from '@aragon/sdk-client'


interface Client {
  chainId: number
  chainName: string
  environment: string
}

interface ClientContext {
  client: ClientDaoERC20Voting
}

const UseClientContext = createContext<ClientContext>({} as ClientContext)

export const useClient = () => {
  const ctx = useContext(UseClientContext)
  if (ctx === null) {
    throw new Error('useClient() can only be used on the descendants of <UseClientProvider />')
  }
  return ctx
}
export const UseClientProvider = ({ children }: { children: ReactNode }) => {
  const { signer, chainId } = useSigner()
  const [context, setContext] = useState(new SdkContext({
    network: 'rinkeby',
    dao: "dao",
    daoFactoryAddress: "",
  }))
  useEffect(() => {
    if (signer) {
      const context = new SdkContext({
        network: chainId,
        web3Providers: ["https://rinkeby.arbitrum.io"],
        daoFactoryAddress: "0xa0b2B729DE73cd22406d3D5A31816985c04A7cdD",
        signer: signer
      })
      setContext(context)
      setClient(new ClientDaoERC20Voting(context))
    }
  }, [signer, chainId])
  const [client, setClient] = useState(new ClientDaoERC20Voting(context))
  // useEffect(() => {
  //   provider?.getNetwork().then((network) => {
  //     setClient({ ...client, chainId, chainName: network.name })
  //   })
  // }, [chainId])
  const value = {
    client
  }
  return (
    <UseClientContext.Provider value={value}>
      {children}
    </UseClientContext.Provider>
  )
}
