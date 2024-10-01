import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class SetOwner {
    constructor(props?: Partial<SetOwner>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    newOwner!: string

    @IntColumn_({nullable: false})
    chain!: number

    @IntColumn_({nullable: false})
    blockNumber!: number

    @DateTimeColumn_({nullable: false})
    blockTimestamp!: Date

    @StringColumn_({nullable: false})
    transactionHash!: string
}
