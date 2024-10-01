import { mainnet, base } from "viem/chains"
import { createPublicClient, http } from "viem"
import { CHAIN_ID } from "../constants"

export const publicClient = createPublicClient({
  chain: CHAIN_ID === 1 ? mainnet : base,
  transport: http(process.env.RPC_URL),
  batch: {
    multicall: true,
  },
})
