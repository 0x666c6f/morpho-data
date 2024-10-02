import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Oracle {
    constructor(props?: Partial<Oracle>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @BigIntColumn_({nullable: true})
    price!: bigint | undefined | null

    @DateTimeColumn_({nullable: false})
    lastPriceFetchTimestamp!: Date
}
