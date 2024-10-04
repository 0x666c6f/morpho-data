import { TypeormDatabase } from "@subsquid/typeorm-store"
import { processor, VAULT_TOPICS } from "./processor"
import { handleEvent } from "./handlers/genericHandler"
import { Oracle } from "./model"
import { updateOraclePrice } from "./handlers/oracleHandler"
import { getRedis, VAULTS_KEY, VAULTS_PRELOADED_HEIGHT_KEY } from "./services/redis"
import { assertNotNull } from "@subsquid/evm-processor"

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}

export const vaults = new Set<string>()
function start() {
  setupProcessor().then(() => {
    processor.run(new TypeormDatabase({ supportHotBlocks: true }), async ctx => {
      for (const c of ctx.blocks) {
        const oracles = await ctx.store.find(Oracle)
        ctx.log.info(`Processing block ${c.header.height}`)
        for (const log of c.logs) {
          const entity = await handleEvent(ctx, log)
          if (entity) {
            await ctx.store.upsert(entity)
            ctx.log.info(`New event ${entity.constructor.name}`)
            ctx.log.info(entity)
          }
        }

        // Update oracle prices every 100 blocks, once indexer is synced
        if (ctx.isHead && c.header.height % 100 === 0) {
          ctx.log.info("Updating oracle prices...")
          await Promise.all(
            oracles.map(async oracle => {
              await updateOraclePrice(ctx, oracle)
            })
          )
          ctx.log.info("Oracle update complete")
        }
      }
    })
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

start()
