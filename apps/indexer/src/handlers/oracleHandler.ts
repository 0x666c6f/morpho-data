import { Store } from "@subsquid/typeorm-store"
import { Address } from "viem"
import OracleABI from "../../abi/Oracle.json"
import { Oracle } from "../model"
import { ProcessorContext } from "../processor"
import { publicClient } from "../services/chain"
import { ZERO_ADDRESS } from "../constants"
import { getContract } from "viem"

export async function upsertOracle(ctx: ProcessorContext<Store>, address: Address): Promise<Oracle> {
  let oracle = await ctx.store.get(Oracle, address)
  if (oracle == null) {
    oracle = new Oracle({ id: address })
    const oracleContract = getContract({
      address: address,
      abi: OracleABI,
      client: publicClient,
    })
    oracle.lastPriceFetchTimestamp = new Date()
    if (address !== ZERO_ADDRESS) {
      try {
        const price = await oracleContract.read.price()
        oracle.price = price as bigint
      } catch (error) {
        ctx.log.warn(`Failed to fetch price for oracle ${address}`)
      }
    }
    ctx.log.info("Adding new missing oracle")
    ctx.log.info(oracle)
    await ctx.store.save(oracle)
  }
  return oracle
}

export async function updateOraclePrice(
  ctx: ProcessorContext<Store>,
  oracle: Oracle
): Promise<bigint | null | undefined> {
  if (oracle.id === ZERO_ADDRESS) {
    return 0n
  }
  const oracleContract = getContract({
    address: oracle.id as Address,
    abi: OracleABI,
    client: publicClient,
  })
  oracle.lastPriceFetchTimestamp = new Date()

  try {
    const price = await oracleContract.read.price()
    oracle.price = price as bigint
  } catch (error) {
    ctx.log.warn(`Failed to fetch price for oracle ${oracle.id}`)
  }

  await ctx.store.save(oracle)
  return oracle.price
}
