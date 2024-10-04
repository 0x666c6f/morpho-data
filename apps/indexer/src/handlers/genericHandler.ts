import { Log, ProcessorContext } from "../processor"
import { events as morphoBlueEvents } from "../abi/MorphoBlue"
import { events as metaMorphoFactoryEvents } from "../abi/MetaMorphoFactory"
import { events as vaultEvents } from "../abi/MetaMorpho"
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
  VaultDeposit,
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
  VaultWithdraw,
} from "../model"
import { CHAIN_ID } from "../constants"
import { upsertAsset } from "./assetHandler"
import { Store } from "@subsquid/typeorm-store"
import { upsertOracle } from "./oracleHandler"
import { vaults } from "../main"
import { getRedis, VAULTS_KEY } from "../services/redis"

type MorphoBlueEvent =
  | MarketAccrueInterest
  | MarketBorrow
  | MarketCreateMarket
  | MarketLiquidate
  | MarketRepay
  | MarketSetFee
  | MarketSupply
  | MarketSupplyCollateral
  | MarketWithdraw
  | MarketWithdrawCollateral

type MetaMorphoFactoryEvent = VaultCreateMetaMorpho

type VaultEvent =
  | VaultAccrueInterest
  | VaultDeposit
  | VaultReallocateSupply
  | VaultReallocateWithdraw
  | VaultRevokePendingCap
  | VaultRevokePendingGuardian
  | VaultRevokePendingMarketRemoval
  | VaultRevokePendingTimelock
  | VaultSetCap
  | VaultSetCurator
  | VaultSetFee
  | VaultSetFeeRecipient
  | VaultSetGuardian
  | VaultSetIsAllocator
  | VaultSetTimelock
  | VaultSetSkimRecipient
  | VaultSetSupplyQueue
  | VaultSetWithdrawQueue
  | VaultSkim
  | VaultSubmitCap
  | VaultSubmitGuardian
  | VaultSubmitMarketRemoval
  | VaultSubmitTimelock
  | VaultUpdateLastTotalAssets
  | VaultWithdraw

type EventModel = MorphoBlueEvent | MetaMorphoFactoryEvent | VaultEvent

type EventModelConstructor = {
  new (props: any): EventModel
}

const eventMapping: Record<string, { event: any; model: EventModelConstructor }> = {
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
  [metaMorphoFactoryEvents.CreateMetaMorpho.topic]: {
    event: metaMorphoFactoryEvents.CreateMetaMorpho,
    model: VaultCreateMetaMorpho,
  },

  // Vault events
  [vaultEvents.AccrueInterest.topic]: { event: vaultEvents.AccrueInterest, model: VaultAccrueInterest },
  [vaultEvents.Deposit.topic]: { event: vaultEvents.Deposit, model: VaultDeposit },
  [vaultEvents.ReallocateSupply.topic]: { event: vaultEvents.ReallocateSupply, model: VaultReallocateSupply },
  [vaultEvents.ReallocateWithdraw.topic]: { event: vaultEvents.ReallocateWithdraw, model: VaultReallocateWithdraw },
  [vaultEvents.RevokePendingCap.topic]: { event: vaultEvents.RevokePendingCap, model: VaultRevokePendingCap },
  [vaultEvents.RevokePendingGuardian.topic]: {
    event: vaultEvents.RevokePendingGuardian,
    model: VaultRevokePendingGuardian,
  },
  [vaultEvents.RevokePendingMarketRemoval.topic]: {
    event: vaultEvents.RevokePendingMarketRemoval,
    model: VaultRevokePendingMarketRemoval,
  },
  [vaultEvents.RevokePendingTimelock.topic]: {
    event: vaultEvents.RevokePendingTimelock,
    model: VaultRevokePendingTimelock,
  },
  [vaultEvents.SetCap.topic]: { event: vaultEvents.SetCap, model: VaultSetCap },
  [vaultEvents.SetCurator.topic]: { event: vaultEvents.SetCurator, model: VaultSetCurator },
  [vaultEvents.SetFee.topic]: { event: vaultEvents.SetFee, model: VaultSetFee },
  [vaultEvents.SetFeeRecipient.topic]: { event: vaultEvents.SetFeeRecipient, model: VaultSetFeeRecipient },
  [vaultEvents.SetGuardian.topic]: { event: vaultEvents.SetGuardian, model: VaultSetGuardian },
  [vaultEvents.SetIsAllocator.topic]: { event: vaultEvents.SetIsAllocator, model: VaultSetIsAllocator },
  [vaultEvents.SetSkimRecipient.topic]: { event: vaultEvents.SetSkimRecipient, model: VaultSetSkimRecipient },
  [vaultEvents.SetSupplyQueue.topic]: { event: vaultEvents.SetSupplyQueue, model: VaultSetSupplyQueue },
  [vaultEvents.SetTimelock.topic]: { event: vaultEvents.SetTimelock, model: VaultSetTimelock },
  [vaultEvents.SetWithdrawQueue.topic]: { event: vaultEvents.SetWithdrawQueue, model: VaultSetWithdrawQueue },
  [vaultEvents.Skim.topic]: { event: vaultEvents.Skim, model: VaultSkim },
  [vaultEvents.SubmitCap.topic]: { event: vaultEvents.SubmitCap, model: VaultSubmitCap },
  [vaultEvents.SubmitGuardian.topic]: { event: vaultEvents.SubmitGuardian, model: VaultSubmitGuardian },
  [vaultEvents.SubmitMarketRemoval.topic]: { event: vaultEvents.SubmitMarketRemoval, model: VaultSubmitMarketRemoval },
  [vaultEvents.SubmitTimelock.topic]: { event: vaultEvents.SubmitTimelock, model: VaultSubmitTimelock },
  [vaultEvents.UpdateLastTotalAssets.topic]: {
    event: vaultEvents.UpdateLastTotalAssets,
    model: VaultUpdateLastTotalAssets,
  },
  [vaultEvents.Withdraw.topic]: { event: vaultEvents.Withdraw, model: VaultWithdraw },
}

export async function handleEvent(ctx: ProcessorContext<Store>, log: Log): Promise<EventModel> {
  const eventData = eventMapping[log.topics[0]]
  if (!eventData) {
    throw new Error(`Unsupported event topic: ${log.topics[0]}`)
  }

  const { event, model } = eventData

  const decodedEvent = event.decode(log)

  if (model === VaultCreateMetaMorpho && !vaults.has(decodedEvent.metaMorpho)) {
    ctx.log.info(`Caching new vault ${decodedEvent.metaMorpho}`)
    const redis = getRedis()
    await redis.sAdd(VAULTS_KEY, decodedEvent.metaMorpho)
    throw new Error("VaultCreateMetaMorpho created, restarting process")
  }

  const baseEventData = {
    blockNumber: log.block.height,
    blockTimestamp: new Date(log.block.timestamp),
    transactionHash: log.transaction?.hash,
    chain: CHAIN_ID,
  }

  let entityModel: EventModel

  if (model === MarketCreateMarket) {
    await Promise.all([
      upsertAsset(ctx, decodedEvent.marketParams.loanToken),
      upsertAsset(ctx, decodedEvent.marketParams.collateralToken),
      upsertOracle(ctx, decodedEvent.marketParams.oracle),
    ])
    entityModel = new model({
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
  ;(entityModel as MorphoBlueEvent).marketId = decodedEvent.id
  ;(entityModel as VaultEvent).vaultId = log.address

  return entityModel
}
