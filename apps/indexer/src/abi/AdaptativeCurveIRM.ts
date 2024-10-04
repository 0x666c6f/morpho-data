import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    BorrowRateUpdate: event("0x7120161a7b3d31251e01294ab351ef15a41b91659a36032e4641bb89b121e321", "BorrowRateUpdate(bytes32,uint256,uint256)", {"id": indexed(p.bytes32), "avgBorrowRate": p.uint256, "rateAtTarget": p.uint256}),
}

export const functions = {
    MORPHO: viewFun("0x3acb5624", "MORPHO()", {}, p.address),
    borrowRate: fun("0x9451fed4", "borrowRate((address,address,address,address,uint256),(uint128,uint128,uint128,uint128,uint128,uint128))", {"marketParams": p.struct({"loanToken": p.address, "collateralToken": p.address, "oracle": p.address, "irm": p.address, "lltv": p.uint256}), "market": p.struct({"totalSupplyAssets": p.uint128, "totalSupplyShares": p.uint128, "totalBorrowAssets": p.uint128, "totalBorrowShares": p.uint128, "lastUpdate": p.uint128, "fee": p.uint128})}, p.uint256),
    borrowRateView: viewFun("0x8c00bf6b", "borrowRateView((address,address,address,address,uint256),(uint128,uint128,uint128,uint128,uint128,uint128))", {"marketParams": p.struct({"loanToken": p.address, "collateralToken": p.address, "oracle": p.address, "irm": p.address, "lltv": p.uint256}), "market": p.struct({"totalSupplyAssets": p.uint128, "totalSupplyShares": p.uint128, "totalBorrowAssets": p.uint128, "totalBorrowShares": p.uint128, "lastUpdate": p.uint128, "fee": p.uint128})}, p.uint256),
    rateAtTarget: viewFun("0x01977b57", "rateAtTarget(bytes32)", {"_0": p.bytes32}, p.int256),
}

export class Contract extends ContractBase {

    MORPHO() {
        return this.eth_call(functions.MORPHO, {})
    }

    borrowRateView(marketParams: BorrowRateViewParams["marketParams"], market: BorrowRateViewParams["market"]) {
        return this.eth_call(functions.borrowRateView, {marketParams, market})
    }

    rateAtTarget(_0: RateAtTargetParams["_0"]) {
        return this.eth_call(functions.rateAtTarget, {_0})
    }
}

/// Event types
export type BorrowRateUpdateEventArgs = EParams<typeof events.BorrowRateUpdate>

/// Function types
export type MORPHOParams = FunctionArguments<typeof functions.MORPHO>
export type MORPHOReturn = FunctionReturn<typeof functions.MORPHO>

export type BorrowRateParams = FunctionArguments<typeof functions.borrowRate>
export type BorrowRateReturn = FunctionReturn<typeof functions.borrowRate>

export type BorrowRateViewParams = FunctionArguments<typeof functions.borrowRateView>
export type BorrowRateViewReturn = FunctionReturn<typeof functions.borrowRateView>

export type RateAtTargetParams = FunctionArguments<typeof functions.rateAtTarget>
export type RateAtTargetReturn = FunctionReturn<typeof functions.rateAtTarget>

