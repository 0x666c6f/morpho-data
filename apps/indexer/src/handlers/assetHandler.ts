import { Store } from "@subsquid/typeorm-store"
import { Asset } from "../model"
import { ProcessorContext } from "../processor"
import ERC20_ABI from "../../abi/ERC20.json"
import { Address, getContract } from "viem"
import { publicClient } from "../services/chain"
import { MAKER } from "../constants"

export async function upsertAsset(ctx: ProcessorContext<Store>, address: Address): Promise<Asset> {
  let asset = await ctx.store.get(Asset, address)
  if (asset === undefined) {
    asset = new Asset({ id: address })

    const erc20 = getContract({
      address: address,
      abi: ERC20_ABI,
      // 1a. Insert a single client
      client: publicClient,
    })
    if (address === MAKER) {
      asset.symbol = "MKR"
      asset.decimals = 18
    } else {
      try {
        const symbol = (await erc20.read.symbol()) as string
        asset.symbol = symbol
      } catch (error) {
        asset.symbol = "UNKNOWN"
      }

      try {
        const decimals = (await erc20.read.decimals()) as number
        asset.decimals = decimals
      } catch (error) {
        asset.decimals = 18
      }
    }

    ctx.log.info("Adding new missing asset")
    ctx.log.info(asset)
    await ctx.store.save(asset)
  }
  return asset
}
