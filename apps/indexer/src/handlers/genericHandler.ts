import { Log, ProcessorContext } from "../processor"
import { events } from "../abi/MorphoBlue"
import {
  MarketAccrueInterest,
  MarketBorrow,
  MarketCreateMarket,
  MarketLiquidate,
  MarketRepay,
  MarketSetFee,
  MarketSupply,
  MarketSupplyCollateral,
  MarketWithdraw,
  MarketWithdrawCollateral,
} from "../model"
import { CHAIN_ID } from "../constants"
import { upsertAsset } from "./assetHandler"
import { Store } from "@subsquid/typeorm-store"
import { upsertOracle } from "./oracleHandler"

type EventClass =
  | typeof MarketAccrueInterest
  | typeof MarketBorrow
  | typeof MarketCreateMarket
  | typeof MarketLiquidate
  | typeof MarketRepay
  | typeof MarketSetFee
  | typeof MarketSupply
  | typeof MarketSupplyCollateral
  | typeof MarketWithdraw
  | typeof MarketWithdrawCollateral

type EventInstance = InstanceType<EventClass>

const eventMapping: Record<string, { event: any; model: EventClass }> = {
  [events.AccrueInterest.topic]: { event: events.AccrueInterest, model: MarketAccrueInterest },
  [events.Borrow.topic]: { event: events.Borrow, model: MarketBorrow },
  [events.CreateMarket.topic]: { event: events.CreateMarket, model: MarketCreateMarket },
  [events.Liquidate.topic]: { event: events.Liquidate, model: MarketLiquidate },
  [events.Repay.topic]: { event: events.Repay, model: MarketRepay },
  [events.SetFee.topic]: { event: events.SetFee, model: MarketSetFee },
  [events.Supply.topic]: { event: events.Supply, model: MarketSupply },
  [events.SupplyCollateral.topic]: { event: events.SupplyCollateral, model: MarketSupplyCollateral },
  [events.Withdraw.topic]: { event: events.Withdraw, model: MarketWithdraw },
  [events.WithdrawCollateral.topic]: { event: events.WithdrawCollateral, model: MarketWithdrawCollateral },
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

  if (model === MarketCreateMarket) {
    await Promise.all([
      upsertAsset(ctx, decodedEvent.marketParams.loanToken),
      upsertAsset(ctx, decodedEvent.marketParams.collateralToken),
      upsertOracle(ctx, decodedEvent.marketParams.oracle),
    ])
    entityModel = new MarketCreateMarket({
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
