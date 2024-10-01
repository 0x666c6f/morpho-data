import { Log } from "../processor"
import { events } from "../abi/MorphoBlue"
import {
  AccrueInterest,
  Borrow,
  CreateMarket,
  Liquidate,
  MarketParams,
  Repay,
  SupplyCollateral,
  Withdraw,
  WithdrawCollateral,
} from "../model"
import { CHAIN_ID } from "../constants"

type EventClass =
  | typeof AccrueInterest
  | typeof Borrow
  | typeof CreateMarket
  | typeof Liquidate
  | typeof Repay
  | typeof SupplyCollateral
  | typeof Withdraw
  | typeof WithdrawCollateral

const eventMapping: Record<string, { event: any; model: EventClass }> = {
  [events.AccrueInterest.topic]: { event: events.AccrueInterest, model: AccrueInterest },
  [events.Borrow.topic]: { event: events.Borrow, model: Borrow },
  [events.CreateMarket.topic]: { event: events.CreateMarket, model: CreateMarket },
  [events.Liquidate.topic]: { event: events.Liquidate, model: Liquidate },
  [events.Repay.topic]: { event: events.Repay, model: Repay },
  [events.SupplyCollateral.topic]: { event: events.SupplyCollateral, model: SupplyCollateral },
  [events.Withdraw.topic]: { event: events.Withdraw, model: Withdraw },
  [events.WithdrawCollateral.topic]: { event: events.WithdrawCollateral, model: WithdrawCollateral },
}

export function handleEvent(log: Log) {
  const eventData = eventMapping[log.topics[0]]
  if (!eventData) {
    throw new Error(`Unsupported event topic: ${log.topics[0]}`)
  }

  const { event, model } = eventData
  const decodedEvent = event.decode(log)

  const baseEventData = {
    id: decodedEvent.id,
    blockNumber: log.block.height,
    blockTimestamp: new Date(log.block.timestamp),
    transactionHash: log.transaction?.hash,
    chain: CHAIN_ID,
  }

  if (model === CreateMarket) {
    return new model({
      ...baseEventData,
      ...decodedEvent,
      marketParams: new MarketParams({
        loanToken: decodedEvent.marketParams.loanToken,
        collateralToken: decodedEvent.marketParams.collateralToken,
        oracle: decodedEvent.marketParams.oracle,
        irm: decodedEvent.marketParams.irm,
        lltv: decodedEvent.marketParams.lltv,
      }),
    })
  }

  return new model({
    ...baseEventData,
    ...decodedEvent,
  })
}
