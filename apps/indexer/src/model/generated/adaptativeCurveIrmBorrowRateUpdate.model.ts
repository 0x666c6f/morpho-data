import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class AdaptativeCurveIRMBorrowRateUpdate {
    constructor(props?: Partial<AdaptativeCurveIRMBorrowRateUpdate>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    marketId!: string

    @BigIntColumn_({nullable: false})
    avgBorrowRate!: bigint

    @BigIntColumn_({nullable: false})
    rateAtTarget!: bigint

    @IntColumn_({nullable: false})
    chain!: number

    @IntColumn_({nullable: false})
    blockNumber!: number

    @DateTimeColumn_({nullable: false})
    blockTimestamp!: Date
}
