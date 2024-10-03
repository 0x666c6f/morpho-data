import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class VaultDeposit {
    constructor(props?: Partial<VaultDeposit>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    vaultId!: string

    @StringColumn_({nullable: false})
    sender!: string

    @StringColumn_({nullable: false})
    owner!: string

    @BigIntColumn_({nullable: false})
    assets!: bigint

    @BigIntColumn_({nullable: false})
    shares!: bigint

    @IntColumn_({nullable: false})
    chain!: number

    @IntColumn_({nullable: false})
    blockNumber!: number

    @DateTimeColumn_({nullable: false})
    blockTimestamp!: Date
}
