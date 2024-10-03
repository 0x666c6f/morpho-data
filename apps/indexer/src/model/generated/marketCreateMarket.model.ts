import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class MarketCreateMarket {
    constructor(props?: Partial<MarketCreateMarket>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    marketId!: string

    @StringColumn_({nullable: false})
    loanToken!: string

    @StringColumn_({nullable: false})
    collateralToken!: string

    @StringColumn_({nullable: false})
    oracle!: string

    @StringColumn_({nullable: false})
    irm!: string

    @BigIntColumn_({nullable: false})
    lltv!: bigint

    @IntColumn_({nullable: false})
    chain!: number

    @IntColumn_({nullable: false})
    blockNumber!: number

    @DateTimeColumn_({nullable: false})
    blockTimestamp!: Date
}
