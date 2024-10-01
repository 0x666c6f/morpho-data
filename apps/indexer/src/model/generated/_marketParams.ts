import assert from "assert"
import * as marshal from "./marshal"

export class MarketParams {
    private _loanToken!: string
    private _collateralToken!: string
    private _oracle!: string
    private _irm!: string
    private _lltv!: bigint

    constructor(props?: Partial<Omit<MarketParams, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._loanToken = marshal.string.fromJSON(json.loanToken)
            this._collateralToken = marshal.string.fromJSON(json.collateralToken)
            this._oracle = marshal.string.fromJSON(json.oracle)
            this._irm = marshal.string.fromJSON(json.irm)
            this._lltv = marshal.bigint.fromJSON(json.lltv)
        }
    }

    get loanToken(): string {
        assert(this._loanToken != null, 'uninitialized access')
        return this._loanToken
    }

    set loanToken(value: string) {
        this._loanToken = value
    }

    get collateralToken(): string {
        assert(this._collateralToken != null, 'uninitialized access')
        return this._collateralToken
    }

    set collateralToken(value: string) {
        this._collateralToken = value
    }

    get oracle(): string {
        assert(this._oracle != null, 'uninitialized access')
        return this._oracle
    }

    set oracle(value: string) {
        this._oracle = value
    }

    get irm(): string {
        assert(this._irm != null, 'uninitialized access')
        return this._irm
    }

    set irm(value: string) {
        this._irm = value
    }

    get lltv(): bigint {
        assert(this._lltv != null, 'uninitialized access')
        return this._lltv
    }

    set lltv(value: bigint) {
        this._lltv = value
    }

    toJSON(): object {
        return {
            loanToken: this.loanToken,
            collateralToken: this.collateralToken,
            oracle: this.oracle,
            irm: this.irm,
            lltv: marshal.bigint.toJSON(this.lltv),
        }
    }
}
