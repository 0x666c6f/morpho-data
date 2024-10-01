import { assertNotNull } from "@subsquid/evm-processor"

export const CHAIN_ID = Number(assertNotNull(process.env.CHAIN_ID, "No Chain ID supplied"))
export const MORPHO_BLUE_ADDRESS = "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb"
