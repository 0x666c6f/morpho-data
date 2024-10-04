import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    PublicReallocateTo: event("0xf8ae80b0854dfc3c73d3eb4b6160df1996a5859e6c1d11d10f3980a7f4691991", "PublicReallocateTo(address,address,bytes32,uint256)", {"sender": indexed(p.address), "vault": indexed(p.address), "supplyMarketId": indexed(p.bytes32), "suppliedAssets": p.uint256}),
    PublicWithdrawal: event("0x6218cdb9e8efb3d0e8136d32c91d9446eaf19e2e486bc67dfcb3d574ca60d504", "PublicWithdrawal(address,address,bytes32,uint256)", {"sender": indexed(p.address), "vault": indexed(p.address), "id": indexed(p.bytes32), "withdrawnAssets": p.uint256}),
    SetAdmin: event("0xc51248b3e510a1244e01043dffdc0132d10194bd4506382cbcf83d05f6ec57ef", "SetAdmin(address,address,address)", {"sender": indexed(p.address), "vault": indexed(p.address), "admin": p.address}),
    SetFee: event("0x44a6d70a601a6f8a85c075467e9d7245897140cbf6dd505c9d9d764459f5fb64", "SetFee(address,address,uint256)", {"sender": indexed(p.address), "vault": indexed(p.address), "fee": p.uint256}),
    SetFlowCaps: event("0x709e1cb4b0ac458eb1c1a9c708e841ee963b229247afbf1437bd39e01ae4aa14", "SetFlowCaps(address,address,(bytes32,(uint128,uint128))[])", {"sender": indexed(p.address), "vault": indexed(p.address), "config": p.array(p.struct({"id": p.bytes32, "caps": p.struct({"maxIn": p.uint128, "maxOut": p.uint128})}))}),
    TransferFee: event("0x6ab9f885fa0bfd2af57586f4cdde83bbfc79294d0cd2d61d4b31e9a3d1be6e2c", "TransferFee(address,address,uint256,address)", {"sender": indexed(p.address), "vault": indexed(p.address), "amount": p.uint256, "feeRecipient": indexed(p.address)}),
}

export const functions = {
    MORPHO: viewFun("0x3acb5624", "MORPHO()", {}, p.address),
    accruedFee: viewFun("0x91b114b2", "accruedFee(address)", {"_0": p.address}, p.uint256),
    admin: viewFun("0x63a846f8", "admin(address)", {"_0": p.address}, p.address),
    fee: viewFun("0x6fcca69b", "fee(address)", {"_0": p.address}, p.uint256),
    flowCaps: viewFun("0x9dbcd5b9", "flowCaps(address,bytes32)", {"_0": p.address, "_1": p.bytes32}, {"maxIn": p.uint128, "maxOut": p.uint128}),
    reallocateTo: fun("0x833947fd", "reallocateTo(address,((address,address,address,address,uint256),uint128)[],(address,address,address,address,uint256))", {"vault": p.address, "withdrawals": p.array(p.struct({"marketParams": p.struct({"loanToken": p.address, "collateralToken": p.address, "oracle": p.address, "irm": p.address, "lltv": p.uint256}), "amount": p.uint128})), "supplyMarketParams": p.struct({"loanToken": p.address, "collateralToken": p.address, "oracle": p.address, "irm": p.address, "lltv": p.uint256})}, ),
    setAdmin: fun("0xc55b6bb7", "setAdmin(address,address)", {"vault": p.address, "newAdmin": p.address}, ),
    setFee: fun("0xe55156b5", "setFee(address,uint256)", {"vault": p.address, "newFee": p.uint256}, ),
    setFlowCaps: fun("0xf4618046", "setFlowCaps(address,(bytes32,(uint128,uint128))[])", {"vault": p.address, "config": p.array(p.struct({"id": p.bytes32, "caps": p.struct({"maxIn": p.uint128, "maxOut": p.uint128})}))}, ),
    transferFee: fun("0x0e4eecf8", "transferFee(address,address)", {"vault": p.address, "feeRecipient": p.address}, ),
}

export class Contract extends ContractBase {

    MORPHO() {
        return this.eth_call(functions.MORPHO, {})
    }

    accruedFee(_0: AccruedFeeParams["_0"]) {
        return this.eth_call(functions.accruedFee, {_0})
    }

    admin(_0: AdminParams["_0"]) {
        return this.eth_call(functions.admin, {_0})
    }

    fee(_0: FeeParams["_0"]) {
        return this.eth_call(functions.fee, {_0})
    }

    flowCaps(_0: FlowCapsParams["_0"], _1: FlowCapsParams["_1"]) {
        return this.eth_call(functions.flowCaps, {_0, _1})
    }
}

/// Event types
export type PublicReallocateToEventArgs = EParams<typeof events.PublicReallocateTo>
export type PublicWithdrawalEventArgs = EParams<typeof events.PublicWithdrawal>
export type SetAdminEventArgs = EParams<typeof events.SetAdmin>
export type SetFeeEventArgs = EParams<typeof events.SetFee>
export type SetFlowCapsEventArgs = EParams<typeof events.SetFlowCaps>
export type TransferFeeEventArgs = EParams<typeof events.TransferFee>

/// Function types
export type MORPHOParams = FunctionArguments<typeof functions.MORPHO>
export type MORPHOReturn = FunctionReturn<typeof functions.MORPHO>

export type AccruedFeeParams = FunctionArguments<typeof functions.accruedFee>
export type AccruedFeeReturn = FunctionReturn<typeof functions.accruedFee>

export type AdminParams = FunctionArguments<typeof functions.admin>
export type AdminReturn = FunctionReturn<typeof functions.admin>

export type FeeParams = FunctionArguments<typeof functions.fee>
export type FeeReturn = FunctionReturn<typeof functions.fee>

export type FlowCapsParams = FunctionArguments<typeof functions.flowCaps>
export type FlowCapsReturn = FunctionReturn<typeof functions.flowCaps>

export type ReallocateToParams = FunctionArguments<typeof functions.reallocateTo>
export type ReallocateToReturn = FunctionReturn<typeof functions.reallocateTo>

export type SetAdminParams = FunctionArguments<typeof functions.setAdmin>
export type SetAdminReturn = FunctionReturn<typeof functions.setAdmin>

export type SetFeeParams = FunctionArguments<typeof functions.setFee>
export type SetFeeReturn = FunctionReturn<typeof functions.setFee>

export type SetFlowCapsParams = FunctionArguments<typeof functions.setFlowCaps>
export type SetFlowCapsReturn = FunctionReturn<typeof functions.setFlowCaps>

export type TransferFeeParams = FunctionArguments<typeof functions.transferFee>
export type TransferFeeReturn = FunctionReturn<typeof functions.transferFee>

