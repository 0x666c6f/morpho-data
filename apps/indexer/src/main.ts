import { TypeormDatabase } from "@subsquid/typeorm-store"
import { processBlocksGeneric, processor, VAULT_TOPICS } from "./processor"
import { Oracle } from "./model"
import { updateOraclePrice } from "./handlers/oracleHandler"
import { getRedis, VAULTS_KEY, VAULTS_PRELOADED_HEIGHT_KEY } from "./services/redis"
import { assertNotNull } from "@subsquid/evm-processor"
import { publicClient } from "./services/chain"
import { METAMORPHO_FACTORY_ADDRESS } from "./constants"
import { events as metaMorphoFactoryEvents } from "./abi/MetaMorphoFactory"
import { Address, parseAbiItem } from "viem"

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}

export const vaults = new Set<string>()
function startMain(name?: string) {
  setupProcessor().then(() => {
    processor.run(
      new TypeormDatabase({
        supportHotBlocks: true,
        stateSchema: name ? `main-${process.env.CHAIN_ID}-${name}` : `main-${process.env.CHAIN_ID}`,
      }),
      async ctx => {
        await processBlocksGeneric(ctx)
        const oracles = await ctx.store.find(Oracle)
        if (ctx.isHead && ctx.blocks[ctx.blocks.length - 1].header.height % 100 === 0) {
          ctx.log.info("Updating oracle prices...")
          await Promise.all(
            oracles.map(async oracle => {
              await updateOraclePrice(ctx, oracle)
            })
          )
          ctx.log.info("Oracle update complete")
        }
      }
    )
  })
}

async function setupProcessor() {
  const head = await publicClient.getBlockNumber()
  const start = BigInt(assertNotNull(process.env.START_BLOCK, "No start block supplied"))
  const logs = await publicClient.getLogs({
    address: METAMORPHO_FACTORY_ADDRESS,
    fromBlock: start,
    toBlock: BigInt(head),
    event: parseAbiItem(
      "event CreateMetaMorpho(address indexed metaMorpho,address indexed caller,address initialOwner,uint256 initialTimelock,address indexed asset,string name,string symbol,bytes32 salt)"
    ),
  })
  for (const log of logs) {
    vaults.add(log.args.metaMorpho as Address)
  }
  processor.addLog({
    address: Array.from(vaults),
    range: {
      from: Number(start),
      to: Number(head),
    },
    topic0: VAULT_TOPICS,
  })

  processor.addLog({
    range: { from: Number(head) + 1 },
    topic0: VAULT_TOPICS,
  })
}

startMain()
