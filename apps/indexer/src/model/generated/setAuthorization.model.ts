import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BooleanColumn as BooleanColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class SetAuthorization {
    constructor(props?: Partial<SetAuthorization>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    caller!: string

    @StringColumn_({nullable: false})
    authorizer!: string

    @StringColumn_({nullable: false})
    authorized!: string

    @BooleanColumn_({nullable: false})
    newIsAuthorized!: boolean

    @IntColumn_({nullable: false})
    chain!: number

    @IntColumn_({nullable: false})
    blockNumber!: number

    @DateTimeColumn_({nullable: false})
    blockTimestamp!: Date
}
