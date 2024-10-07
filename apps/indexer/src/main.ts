import { TypeormDatabase } from "@subsquid/typeorm-store"
import { processBlocksGeneric, processor, VAULT_TOPICS } from "./processor"
import { Oracle } from "./model"
import { updateOraclePrice } from "./handlers/oracleHandler"
import { getRedis, VAULTS_KEY, VAULTS_PRELOADED_HEIGHT_KEY } from "./services/redis"
import { assertNotNull } from "@subsquid/evm-processor"

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}

export const vaults = new Set<string>()
function startMain(name?: string) {
  setupProcessor().then(() => {
    processor.run(
      new TypeormDatabase({
        supportHotBlocks: true,
        stateSchema: name ? `main-${process.env.CHAIN_ID}-${name}` : `main-${process.env.CHAIN_ID}`,
      }),
      async ctx => {
        await processBlocksGeneric(ctx)
        const oracles = await ctx.store.find(Oracle)
        if (ctx.isHead && ctx.blocks[ctx.blocks.length - 1].header.height % 100 === 0) {
          ctx.log.info("Updating oracle prices...")
          await Promise.all(
            oracles.map(async oracle => {
              await updateOraclePrice(ctx, oracle)
            })
          )
          ctx.log.info("Oracle update complete")
        }
      }
    )
  })
}

async function setupProcessor() {
  const redis = getRedis()
  const cachedVaults = await redis.sMembers(VAULTS_KEY)
  for (const vault of cachedVaults) {
    vaults.add(vault)
  }
  const preloadHeight = await redis.get(VAULTS_PRELOADED_HEIGHT_KEY)
  const preloadedData = preloadHeight && cachedVaults.length > 0
  if (preloadedData) {
    processor.addLog({
      address: Array.from(vaults),
      range: {
        from: Number(assertNotNull(process.env.START_BLOCK, "No start block supplied")),
        to: Number(preloadHeight),
      },
      topic0: VAULT_TOPICS,
    })
  }
  processor.addLog({
    range: preloadedData
      ? {
          from: Number(preloadHeight) + 1,
        }
      : undefined,
    topic0: VAULT_TOPICS,
  })
}

startMain()
