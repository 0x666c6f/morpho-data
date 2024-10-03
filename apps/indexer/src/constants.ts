import { assertNotNull } from "@subsquid/evm-processor"
import { Address } from "viem"

export const CHAIN_ID = Number(assertNotNull(process.env.CHAIN_ID, "No Chain ID supplied"))
export const MORPHO_BLUE_ADDRESS: Address = "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb"
export const MORPHO_CHAINLINK_ORACLE_FACTORY_ADDRESS: Address = "0x3A7bB36Ee3f3eE32A60e9f2b33c1e5f2E83ad766"
export const CREATE_MORPHO_CHAINLINK_ORACLE_V2_SIGHASH = "0x3a7bb36e"
export const ZERO_ADDRESS: Address = "0x0000000000000000000000000000000000000000"
export const MAKER: Address = "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2"
