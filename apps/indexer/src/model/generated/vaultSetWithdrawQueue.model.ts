import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class VaultSetWithdrawQueue {
    constructor(props?: Partial<VaultSetWithdrawQueue>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    vaultId!: string

    @StringColumn_({nullable: false})
    caller!: string

    @StringColumn_({array: true, nullable: false})
    newWithdrawQueue!: (string)[]

    @IntColumn_({nullable: false})
    chain!: number

    @IntColumn_({nullable: false})
    blockNumber!: number

    @DateTimeColumn_({nullable: false})
    blockTimestamp!: Date
}
