import { events as morphoBlueEvents } from "./abi/MorphoBlue"
import { events as metaMorphoFactoryEvents } from "./abi/MetaMorphoFactory"
import { events as vaultEvents } from "./abi/MetaMorpho"
import { events as adaptativeCurveIRMEvents } from "./abi/AdaptativeCurveIRM"
import { events as publicAllocatorEvents } from "./abi/MorphoPublicAllocator"

import type {
  AdaptativeCurveIRMBorrowRateUpdate,
  Asset,
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
  Oracle,
  PublicAllocatorPublicReallocateTo,
  PublicAllocatorPublicWithdrawal,
  PublicAllocatorSetAdmin,
  PublicAllocatorSetFee,
  PublicAllocatorSetFlowCaps,
  PublicAllocatorTransferFee,
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
} from "./model"
import {
  type BlockData,
  type BlockHeader,
  type DataHandlerContext,
  EvmBatchProcessor,
  type EvmBatchProcessorFields,
  type Log as _Log,
  type Transaction as _Transaction,
} from "@subsquid/evm-processor"
import type { processor } from "./processor"

export type Fields = EvmBatchProcessorFields<typeof processor>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>

export type EventMap = { [key: string]: EventModel[] }

export type MorphoBlueEvent =
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

export type MetaMorphoFactoryEvent = VaultCreateMetaMorpho

export type VaultEvent =
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

export type PublicAllocatorEvent =
  | PublicAllocatorPublicReallocateTo
  | PublicAllocatorPublicWithdrawal
  | PublicAllocatorSetAdmin
  | PublicAllocatorSetFee
  | PublicAllocatorSetFlowCaps
  | PublicAllocatorTransferFee

export type AdaptativeCurveIRMEvent = AdaptativeCurveIRMBorrowRateUpdate

export type EventModel =
  | MorphoBlueEvent
  | MetaMorphoFactoryEvent
  | VaultEvent
  | PublicAllocatorEvent
  | AdaptativeCurveIRMEvent
  | Asset
  | Oracle

export type EventModelConstructor = new (props: any) => EventModel
