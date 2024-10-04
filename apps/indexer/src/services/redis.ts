import { createClient } from "redis"
import { CHAIN_ID } from "../constants"
import { assertNotNull } from "@subsquid/evm-processor"

const client = createClient({
  url: assertNotNull(process.env.REDIS_URL),
})

export const VAULTS_KEY = `${CHAIN_ID}-VAULTS`

export function getRedis() {
  if (!client.isReady) {
    client.connect()
  }
  return client
}
