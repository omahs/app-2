import { ethers } from "ethers"
import { isAddress } from "ethers/lib/utils"
import { useEffect, useState } from "react"
import { useCache } from "./useCache"
import { useClient } from "./useClient"
import  {ICreateDaoERC20Voting} from '@aragon/sdk-client'
export interface Dao {
  id: string
  name: string
  creator: string
  metadata: string
  token: string
}
interface useDaoResponse {
  update: (dao: Dao) => Dao
  create: (dao: ICreateDaoERC20Voting) => Promise<string>
  get: (address: string) => Dao
}

export const useDao = (): useDaoResponse => {
  const { get: getCache, set: setCache } = useCache()
  const { client } = useClient()
  const get = (address: string): Dao => {
    if (!isAddress(address)) {
      throw Error('invalid address when trying to get dao')
    }
    const cacheKey = `dao-${address}`
    const cacheValue = getCache(cacheKey)
    // If dao is in cache return it
    if (cacheValue) {
      return cacheValue
    }
    // client.getDao(address).then((value) => setCache(cacheKey, value)).catch((e)=> throw Error(e))
    const value: Dao = {
      id: address,
      name: 'Placeholder Dao',
      creator: '0x...',
      metadata: '{"some": "props"}',
      token: '1234-456789-1234-12345678'
    }
    setCache(cacheKey, value)
    return value
  }
  const create = (dao: ICreateDaoERC20Voting): Promise<string> => {
    return new Promise((resolve, reject): void => {
      client.dao.create(dao)
        .then((id: string) => {
          resolve(id)
        })
        .catch((e: Error) => {
          reject(e)
        })
    })
  }
  const update = (dao: Dao): Dao => {
    // client.updateDao(dao).then((value) => {
    //   const cacheKey = `dao-${value.id}`
    //   setCache(cacheKey, value)
    // }).catch((e) => { throw Error(e) })
    const cacheKey = `dao-${dao.id}`
    setCache(cacheKey, dao)
    return dao
  }
  return {
    get,
    create,
    update
  }
}
