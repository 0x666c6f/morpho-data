import type { Store } from "@subsquid/typeorm-store"
import { Asset } from "../model"
import ERC20_ABI from "../../abi/ERC20.json"
import { type Address, getContract } from "viem"
import { publicClient } from "../services/chain"
import { MAKER, ZERO_ADDRESS } from "../constants"
import type { ProcessorContext } from "../types"

export async function upsertAsset(ctx: ProcessorContext<Store>, address: Address): Promise<Asset | undefined> {
  let asset = await ctx.store.get(Asset, address)
  if (asset === undefined) {
    asset = new Asset({ id: address })

    const erc20 = getContract({
      address: address,
      abi: ERC20_ABI,
      client: publicClient,
    })
    if (address === MAKER) {
      asset.symbol = "MKR"
      asset.decimals = 18
    } else if (address === ZERO_ADDRESS) {
      asset.symbol = "ZERO_ADDRESS"
      asset.decimals = 18
    } else {
      try {
        const symbol = await erc20.read.symbol()
        asset.symbol = symbol as string
      } catch (error) {
        asset.symbol = "UNKNOWN"
      }

      try {
        const decimals = await erc20.read.decimals()
        asset.decimals = decimals as number
      } catch (error) {
        asset.decimals = 18
      }
    }

    ctx.log.info("Adding new missing asset")
    ctx.log.info(asset)
    return asset
  }
  return undefined
}
