import { assertNotNull } from "@subsquid/util-internal"
import {
  BlockHeader,
  DataHandlerContext,
  EvmBatchProcessor,
  EvmBatchProcessorFields,
  Log as _Log,
  Transaction as _Transaction,
} from "@subsquid/evm-processor"
import { MORPHO_BLUE_ADDRESS } from "./constants"
import { events as morphoBlueEvents } from "./abi/MorphoBlue"

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
      morphoBlueEvents.SupplyCollateral.topic,
      morphoBlueEvents.WithdrawCollateral.topic,
    ],
  })

export type Fields = EvmBatchProcessorFields<typeof processor>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>
