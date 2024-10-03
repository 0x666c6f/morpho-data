import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class VaultCreateMetaMorpho {
    constructor(props?: Partial<VaultCreateMetaMorpho>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    metaMorpho!: string

    @StringColumn_({nullable: false})
    caller!: string

    @StringColumn_({nullable: false})
    initialOwner!: string

    @BigIntColumn_({nullable: false})
    initialTimelock!: bigint

    @StringColumn_({nullable: false})
    asset!: string

    @StringColumn_({nullable: false})
    name!: string

    @StringColumn_({nullable: false})
    symbol!: string

    @StringColumn_({nullable: false})
    salt!: string

    @IntColumn_({nullable: false})
    chain!: number

    @IntColumn_({nullable: false})
    blockNumber!: number

    @DateTimeColumn_({nullable: false})
    blockTimestamp!: Date
}
