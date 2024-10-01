import { TypeormDatabase } from "@subsquid/typeorm-store"
import { processor } from "./processor"
import { events } from "./abi/MorphoBlue"
import { AccrueInterest, Borrow, CreateMarket, Liquidate, Repay, SupplyCollateral, WithdrawCollateral } from "./model"
import { Entity } from "@subsquid/typeorm-store/lib/store"

const eventMapping = {
  [events.AccrueInterest.topic]: AccrueInterest,
  [events.Borrow.topic]: Borrow,
  [events.CreateMarket.topic]: CreateMarket,
  [events.Liquidate.topic]: Liquidate,
  [events.Repay.topic]: Repay,
  [events.SupplyCollateral.topic]: SupplyCollateral,
  [events.WithdrawCollateral.topic]: WithdrawCollateral,
}

const eventHandlers = {
  [events.AccrueInterest.topic]: AccrueInterest,
  [events.Borrow.topic]: Borrow,
  [events.CreateMarket.topic]: CreateMarket,
  [events.Liquidate.topic]: Liquidate,
  [events.Repay.topic]: Repay,
  [events.SupplyCollateral.topic]: SupplyCollateral,
  [events.WithdrawCollateral.topic]: WithdrawCollateral,
}

processor.run(new TypeormDatabase({ supportHotBlocks: true }), async ctx => {
  const entitiesToPersist: Entity[] = []
  for (let c of ctx.blocks) {
    for (let log of c.logs) {
      const handler = eventHandlers[log.topics[0]]
      if (handler) {
        entitiesToPersist.push(handler(log))
      }
    }
  }
})
