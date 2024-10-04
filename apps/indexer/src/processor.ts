import { assertNotNull } from "@subsquid/util-internal"
import {
  BlockHeader,
  DataHandlerContext,
  EvmBatchProcessor,
  EvmBatchProcessorFields,
  Log as _Log,
  Transaction as _Transaction,
} from "@subsquid/evm-processor"
import { METAMORPHO_FACTORY_ADDRESS, MORPHO_BLUE_ADDRESS } from "./constants"
import { events as morphoBlueEvents } from "./abi/MorphoBlue"
import { events as metaMorphoFactoryEvents } from "./abi/MetaMorphoFactory"
import { events as vaultEvents } from "./abi/MetaMorpho"

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

export type Fields = EvmBatchProcessorFields<typeof processor>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>
