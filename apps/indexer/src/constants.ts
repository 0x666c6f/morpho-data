import { assertNotNull } from "@subsquid/evm-processor"
import { Address } from "viem"

export const CHAIN_ID = Number(assertNotNull(process.env.CHAIN_ID, "No Chain ID supplied"))
export const MORPHO_BLUE_ADDRESS: Address = "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb"
export const ZERO_ADDRESS: Address = "0x0000000000000000000000000000000000000000"
export const MAKER: Address = "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2"
