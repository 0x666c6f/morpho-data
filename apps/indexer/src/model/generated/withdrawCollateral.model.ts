import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class WithdrawCollateral {
    constructor(props?: Partial<WithdrawCollateral>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    marketId!: string

    @StringColumn_({nullable: false})
    caller!: string

    @StringColumn_({nullable: false})
    onBehalf!: string

    @StringColumn_({nullable: false})
    receiver!: string

    @BigIntColumn_({nullable: false})
    assets!: bigint

    @IntColumn_({nullable: false})
    chain!: number

    @IntColumn_({nullable: false})
    blockNumber!: number

    @DateTimeColumn_({nullable: false})
    blockTimestamp!: Date
}
