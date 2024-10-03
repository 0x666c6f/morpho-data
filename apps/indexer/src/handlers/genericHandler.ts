import { Log, ProcessorContext } from "../processor"
import { events as morphoBlueEvents } from "../abi/MorphoBlue"
import { events as metaMorphoFactoryEvents } from "../abi/MetaMorphoFactory"
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
  VaultAccrueInterest,
  VaultCreateMetaMorpho,
  VaultReallocateSupply,
  VaultReallocateWithdraw,
  VaultRevokePendingCap,
  VaultRevokePendingGuardian,
  VaultRevokePendingMarketRemoval,
  VaultRevokePendingTimelock,
  VaultSetCap,
  VaultSetCurator,
  VaultSetFee,
  VaultSetFeeRecipient,
  VaultSetGuardian,
  VaultSetIsAllocator,
  VaultSetSkimRecipient,
  VaultSetSupplyQueue,
  VaultSetTimelock,
  VaultSetWithdrawQueue,
  VaultSkim,
  VaultSubmitCap,
  VaultSubmitGuardian,
  VaultSubmitMarketRemoval,
  VaultSubmitTimelock,
  VaultUpdateLastTotalAssets,
} from "../model"
import { CHAIN_ID } from "../constants"
import { upsertAsset } from "./assetHandler"
import { Store } from "@subsquid/typeorm-store"
import { upsertOracle } from "./oracleHandler"

type MorphoBlueEvent =
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

type MetaMorphoFactoryEvent = typeof VaultCreateMetaMorpho

type VaultEvent =
  | typeof VaultAccrueInterest
  | typeof VaultReallocateSupply
  | typeof VaultReallocateWithdraw
  | typeof VaultRevokePendingCap
  | typeof VaultRevokePendingGuardian
  | typeof VaultRevokePendingMarketRemoval
  | typeof VaultRevokePendingTimelock
  | typeof VaultSetCap
  | typeof VaultSetCurator
  | typeof VaultSetFee
  | typeof VaultSetFeeRecipient
  | typeof VaultSetGuardian
  | typeof VaultSetIsAllocator
  | typeof VaultSetTimelock
  | typeof VaultSetSkimRecipient
  | typeof VaultSetSupplyQueue
  | typeof VaultSetWithdrawQueue
  | typeof VaultSkim
  | typeof VaultSubmitCap
  | typeof VaultSubmitGuardian
  | typeof VaultSubmitMarketRemoval
  | typeof VaultSubmitTimelock
  | typeof VaultUpdateLastTotalAssets

type EventInstance = InstanceType<MorphoBlueEvent> | InstanceType<MetaMorphoFactoryEvent> | InstanceType<VaultEvent>

const eventMapping: Record<string, { event: any; model: MorphoBlueEvent }> = {
  // MorphoBlue events
  [morphoBlueEvents.AccrueInterest.topic]: { event: morphoBlueEvents.AccrueInterest, model: MarketAccrueInterest },
  [morphoBlueEvents.Borrow.topic]: { event: morphoBlueEvents.Borrow, model: MarketBorrow },
  [morphoBlueEvents.CreateMarket.topic]: { event: morphoBlueEvents.CreateMarket, model: MarketCreateMarket },
  [morphoBlueEvents.Liquidate.topic]: { event: morphoBlueEvents.Liquidate, model: MarketLiquidate },
  [morphoBlueEvents.Repay.topic]: { event: morphoBlueEvents.Repay, model: MarketRepay },
  [morphoBlueEvents.SetFee.topic]: { event: morphoBlueEvents.SetFee, model: MarketSetFee },
  [morphoBlueEvents.Supply.topic]: { event: morphoBlueEvents.Supply, model: MarketSupply },
  [morphoBlueEvents.SupplyCollateral.topic]: {
    event: morphoBlueEvents.SupplyCollateral,
    model: MarketSupplyCollateral,
  },
  [morphoBlueEvents.Withdraw.topic]: { event: morphoBlueEvents.Withdraw, model: MarketWithdraw },
  [morphoBlueEvents.WithdrawCollateral.topic]: {
    event: morphoBlueEvents.WithdrawCollateral,
    model: MarketWithdrawCollateral,
  },
  // MetaMorphoFactory events
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
