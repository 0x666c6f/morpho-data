import { TypeormDatabase } from "@subsquid/typeorm-store"
import { processor } from "./processor"
import { handleEvent } from "./handlers/genericHandler"
import { Oracle } from "./model"
import { updateOraclePrice } from "./handlers/oracleHandler"

processor.run(new TypeormDatabase({ supportHotBlocks: true }), async ctx => {
  for (let c of ctx.blocks) {
    const oracles = await ctx.store.find(Oracle)
    ctx.log.info(`Processing block ${c.header.height}`)
    for (let log of c.logs) {
      const entity = await handleEvent(ctx, log)
      if (entity) {
        await ctx.store.upsert(entity)
        ctx.log.info(`New event ${entity.constructor.name}`)
        ctx.log.info(entity)
      }
    }

    // Update oracle prices every 100 blocks, once indexer is synced
    if (ctx.isHead && c.header.height % 100 === 0) {
      ctx.log.info(`Updating oracle prices...`)
      await Promise.all(
        oracles.map(async oracle => {
          await updateOraclePrice(ctx, oracle)
        })
      )
      ctx.log.info(`Oracle update complete`)
    }
  }
})
