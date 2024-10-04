import { TypeormDatabase } from "@subsquid/typeorm-store"
import { DataSource } from "typeorm"
import { processor } from "./processor"
import { handleEvent } from "./handlers/genericHandler"
import { Oracle, VaultCreateMetaMorpho } from "./model"
import { updateOraclePrice } from "./handlers/oracleHandler"
import { events as vaultEvents } from "./abi/MetaMorpho"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"
import { getRedis, VAULTS_KEY } from "./services/redis"

export const vaults = new Set<string>()
function start() {
  setupProcessor().then(() => {
    processor.run(new TypeormDatabase({ supportHotBlocks: true }), async ctx => {
      for (const c of ctx.blocks) {
        const oracles = await ctx.store.find(Oracle)
        ctx.log.info(`Processing block ${c.header.height}`)
        for (const log of c.logs) {
          const entity = await handleEvent(ctx, log)
          await ctx.store.upsert(entity)
          ctx.log.info(`New event ${entity.constructor.name}`)
          ctx.log.info(entity)
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
  processor.addLog({
    address: Array.from(vaults),
    topic0: [
      vaultEvents.AccrueInterest.topic,
      vaultEvents.Deposit.topic,
      vaultEvents.ReallocateSupply.topic,
      vaultEvents.ReallocateWithdraw.topic,
      vaultEvents.RevokePendingCap.topic,
      vaultEvents.RevokePendingGuardian.topic,
      vaultEvents.RevokePendingMarketRemoval.topic,
      vaultEvents.RevokePendingTimelock.topic,
      vaultEvents.SetCap.topic,
      vaultEvents.SetCurator.topic,
      vaultEvents.SetFee.topic,
      vaultEvents.SetFeeRecipient.topic,
      vaultEvents.SetGuardian.topic,
      vaultEvents.SetIsAllocator.topic,
      vaultEvents.SetSkimRecipient.topic,
      vaultEvents.SetSupplyQueue.topic,
      vaultEvents.SetTimelock.topic,
      vaultEvents.SetWithdrawQueue.topic,
      vaultEvents.Skim.topic,
      vaultEvents.SubmitCap.topic,
      vaultEvents.SubmitGuardian.topic,
      vaultEvents.SubmitMarketRemoval.topic,
      vaultEvents.SubmitTimelock.topic,
      vaultEvents.UpdateLastTotalAssets.topic,
      vaultEvents.Withdraw.topic,
    ],
  })
}

start()
