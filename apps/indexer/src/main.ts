import { TypeormDatabase } from "@subsquid/typeorm-store"
import { processor } from "./processor"
import { handleEvent } from "./handlers/genericHandler"

processor.run(new TypeormDatabase({ supportHotBlocks: true }), async ctx => {
  for (let c of ctx.blocks) {
    ctx.log.info(`Processing block ${c.header.height}`)
    for (let log of c.logs) {
      const entity = await handleEvent(ctx, log)
      if (entity) {
        await ctx.store.upsert(entity)
        ctx.log.info(`New event ${entity.constructor.name}`)
        ctx.log.info(entity)
      }
    }
  }
})
