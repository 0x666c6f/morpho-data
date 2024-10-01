import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Liquidate {
    constructor(props?: Partial<Liquidate>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    caller!: string

    @StringColumn_({nullable: false})
    borrower!: string

    @BigIntColumn_({nullable: false})
    repaidAssets!: bigint

    @BigIntColumn_({nullable: false})
    repaidShares!: bigint

    @BigIntColumn_({nullable: false})
    seizedAssets!: bigint

    @BigIntColumn_({nullable: false})
    badDebtAssets!: bigint

    @BigIntColumn_({nullable: false})
    badDebtShares!: bigint

    @IntColumn_({nullable: false})
    chain!: number

    @IntColumn_({nullable: false})
    blockNumber!: number

    @DateTimeColumn_({nullable: false})
    blockTimestamp!: Date
}
