import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    CreateMorphoChainlinkOracleV2: event("0x6436acb89463dbc9036f1e52aebf32ac0bf5f69e3987c067110c3ac403ebda33", "CreateMorphoChainlinkOracleV2(address,address)", {"caller": p.address, "oracle": p.address}),
}

export const functions = {
    createMorphoChainlinkOracleV2: fun("0xb32cddf4", "createMorphoChainlinkOracleV2(address,uint256,address,address,uint256,address,uint256,address,address,uint256,bytes32)", {"baseVault": p.address, "baseVaultConversionSample": p.uint256, "baseFeed1": p.address, "baseFeed2": p.address, "baseTokenDecimals": p.uint256, "quoteVault": p.address, "quoteVaultConversionSample": p.uint256, "quoteFeed1": p.address, "quoteFeed2": p.address, "quoteTokenDecimals": p.uint256, "salt": p.bytes32}, p.address),
    isMorphoChainlinkOracleV2: viewFun("0x4cf4a264", "isMorphoChainlinkOracleV2(address)", {"_0": p.address}, p.bool),
}

export class Contract extends ContractBase {

    isMorphoChainlinkOracleV2(_0: IsMorphoChainlinkOracleV2Params["_0"]) {
        return this.eth_call(functions.isMorphoChainlinkOracleV2, {_0})
    }
}

/// Event types
export type CreateMorphoChainlinkOracleV2EventArgs = EParams<typeof events.CreateMorphoChainlinkOracleV2>

/// Function types
export type CreateMorphoChainlinkOracleV2Params = FunctionArguments<typeof functions.createMorphoChainlinkOracleV2>
export type CreateMorphoChainlinkOracleV2Return = FunctionReturn<typeof functions.createMorphoChainlinkOracleV2>

export type IsMorphoChainlinkOracleV2Params = FunctionArguments<typeof functions.isMorphoChainlinkOracleV2>
export type IsMorphoChainlinkOracleV2Return = FunctionReturn<typeof functions.isMorphoChainlinkOracleV2>

