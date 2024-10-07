import { assertNotNull } from "@subsquid/util-internal"
import {
  type BlockData,
  type BlockHeader,
  type DataHandlerContext,
  EvmBatchProcessor,
  type EvmBatchProcessorFields,
  type Log as _Log,
  type Transaction as _Transaction,
} from "@subsquid/evm-processor"
import {
  METAMORPHO_FACTORY_ADDRESS,
  MORPHO_ADAPTATIVE_CURVE_IRM_ADDRESS,
  MORPHO_BLUE_ADDRESS,
  MORPHO_PUBLIC_ALLOCATOR_ADDRESS,
} from "./constants"
import { events as morphoBlueEvents } from "./abi/MorphoBlue"
import { events as metaMorphoFactoryEvents } from "./abi/MetaMorphoFactory"
import { events as vaultEvents } from "./abi/MetaMorpho"
import { events as adaptativeCurveIRMEvents } from "./abi/AdaptativeCurveIRM"
import { events as publicAllocatorEvents } from "./abi/MorphoPublicAllocator"
import type { Store } from "@subsquid/typeorm-store"
import { handleEvent } from "./handlers/genericHandler"
import type { EventMap, EventModel, Fields, ProcessorContext } from "./types"

export const VAULT_TOPICS = [
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
]

export const processor = new EvmBatchProcessor()
  // Lookup archive by the network name in Subsquid registry
  // See https://docs.subsquid.io/evm-indexing/supported-networks/
  .setGateway(assertNotNull(process.env.SQD_GATEWAY, "No gateway supplied"))
  // Chain RPC endpoint is required for
  //  - indexing unfinalized blocks https://docs.subsquid.io/basics/unfinalized-blocks/
  //  - querying the contract state https://docs.subsquid.io/evm-indexing/query-state/
  .setRpcEndpoint({
    // Set the URL via .env for local runs or via secrets when deploying to Subsquid Cloud
    // https://docs.subsquid.io/deploy-squid/env-variables/
    url: assertNotNull(process.env.RPC_URL, "No RPC endpoint supplied"),
    // More RPC connection options at https://docs.subsquid.io/evm-indexing/configuration/initialization/#set-data-source
    rateLimit: 10,
  })
  .setFinalityConfirmation(100)
  .setFields({
    log: {
      transactionHash: true,
      topics: true,
      data: true,
    },
    transaction: {
      from: true,
      value: true,
      hash: true,
    },
    block: {
      timestamp: true,
    },
  })
  .setBlockRange({
    from: Number(assertNotNull(process.env.START_BLOCK, "No start block supplied")),
  })
  .addLog({
    address: [MORPHO_BLUE_ADDRESS],
    topic0: [
      morphoBlueEvents.AccrueInterest.topic,
      morphoBlueEvents.Borrow.topic,
      morphoBlueEvents.CreateMarket.topic,
      morphoBlueEvents.Liquidate.topic,
      morphoBlueEvents.Repay.topic,
      morphoBlueEvents.Withdraw.topic,
      morphoBlueEvents.SetFee.topic,
      morphoBlueEvents.Supply.topic,
      morphoBlueEvents.SupplyCollateral.topic,
      morphoBlueEvents.WithdrawCollateral.topic,
    ],
  })
  .addLog({
    address: [METAMORPHO_FACTORY_ADDRESS],
    topic0: [metaMorphoFactoryEvents.CreateMetaMorpho.topic],
  })
  .addLog({
    address: [MORPHO_PUBLIC_ALLOCATOR_ADDRESS],
    topic0: [
      publicAllocatorEvents.PublicReallocateTo.topic,
      publicAllocatorEvents.PublicWithdrawal.topic,
      publicAllocatorEvents.SetAdmin.topic,
      publicAllocatorEvents.SetFee.topic,
      publicAllocatorEvents.SetFlowCaps.topic,
      publicAllocatorEvents.TransferFee.topic,
    ],
  })
  .addLog({
    address: [MORPHO_ADAPTATIVE_CURVE_IRM_ADDRESS],
    topic0: [adaptativeCurveIRMEvents.BorrowRateUpdate.topic],
  })

export async function processLogsGeneric<T>(
  ctx: ProcessorContext<Store>,
  block: BlockData<Fields>,
  eventMap: EventMap
): Promise<void> {
  for (const log of block.logs) {
    await handleEvent(ctx, log, eventMap)
  }
}

export async function processBlockGeneric(ctx: ProcessorContext<Store>, block: BlockData<Fields>, eventMap: EventMap) {
  await processLogsGeneric(ctx, block, eventMap)
}

export async function processBlocksGeneric(ctx: ProcessorContext<Store>): Promise<void> {
  let eventMap: EventMap = {}
  for (const block of ctx.blocks) {
    ctx.log.info(`Processing block ${block.header.height}`)
    await processBlockGeneric(ctx, block, eventMap)
  }
  for (const eventType of Object.keys(eventMap)) {
    await ctx.store.upsert(eventMap[eventType])
  }
  eventMap = {}
}
