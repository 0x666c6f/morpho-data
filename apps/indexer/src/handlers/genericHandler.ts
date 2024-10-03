import { Log, ProcessorContext } from "../processor"
import { events } from "../abi/MorphoBlue"
import {
  AccrueInterest,
  Borrow,
  CreateMarket,
  Liquidate,
  Repay,
  SetFee,
  Supply,
  SupplyCollateral,
  Withdraw,
  WithdrawCollateral,
} from "../model"
import { CHAIN_ID } from "../constants"
import { upsertAsset } from "./assetHandler"
import { Store } from "@subsquid/typeorm-store"
import { upsertOracle } from "./oracleHandler"

type EventClass =
  | typeof AccrueInterest
  | typeof Borrow
  | typeof CreateMarket
  | typeof Liquidate
  | typeof Repay
  | typeof SetFee
  | typeof Supply
  | typeof SupplyCollateral
  | typeof Withdraw
  | typeof WithdrawCollateral

type EventInstance = InstanceType<EventClass>

const eventMapping: Record<string, { event: any; model: EventClass }> = {
  [events.AccrueInterest.topic]: { event: events.AccrueInterest, model: AccrueInterest },
  [events.Borrow.topic]: { event: events.Borrow, model: Borrow },
  [events.CreateMarket.topic]: { event: events.CreateMarket, model: CreateMarket },
  [events.Liquidate.topic]: { event: events.Liquidate, model: Liquidate },
  [events.Repay.topic]: { event: events.Repay, model: Repay },
  [events.SetFee.topic]: { event: events.SetFee, model: SetFee },
  [events.Supply.topic]: { event: events.Supply, model: Supply },
  [events.SupplyCollateral.topic]: { event: events.SupplyCollateral, model: SupplyCollateral },
  [events.Withdraw.topic]: { event: events.Withdraw, model: Withdraw },
  [events.WithdrawCollateral.topic]: { event: events.WithdrawCollateral, model: WithdrawCollateral },
}

export async function handleEvent(ctx: ProcessorContext<Store>, log: Log): Promise<EventInstance> {
  const eventData = eventMapping[log.topics[0]]
  if (!eventData) {
    throw new Error(`Unsupported event topic: ${log.topics[0]}`)
  }

  const { event, model } = eventData
  const decodedEvent = event.decode(log)

  const baseEventData = {
    blockNumber: log.block.height,
    blockTimestamp: new Date(log.block.timestamp),
    transactionHash: log.transaction?.hash,
    chain: CHAIN_ID,
  }

  let entityModel: EventInstance

  if (model === CreateMarket) {
    await Promise.all([
      upsertAsset(ctx, decodedEvent.marketParams.loanToken),
      upsertAsset(ctx, decodedEvent.marketParams.collateralToken),
      upsertOracle(ctx, decodedEvent.marketParams.oracle),
    ])
    entityModel = new CreateMarket({
      ...baseEventData,
      ...decodedEvent,
      ...decodedEvent.marketParams,
    })
  } else {
    entityModel = new model({
      ...baseEventData,
      ...decodedEvent,
    })
  }

  entityModel.id = log.id
  entityModel.marketId = decodedEvent.id

  return entityModel
}
