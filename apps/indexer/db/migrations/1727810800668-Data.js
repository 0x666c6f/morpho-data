module.exports = class Data1727810800668 {
    name = 'Data1727810800668'

    async up(db) {
        await db.query(`CREATE TABLE "set_owner" ("id" character varying NOT NULL, "new_owner" text NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_b9aa020e0486adfae9531315479" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "set_fee" ("id" character varying NOT NULL, "new_fee" numeric NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_2fce55f7f2e7947fc3bae90f0fa" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "set_fee_recipient" ("id" character varying NOT NULL, "new_fee_recipient" text NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_177e4d76c772ce4ccf90df13c46" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "enable_irm" ("id" character varying NOT NULL, "irm" text NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_a041290e3aab3205306b7e315db" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "enable_lltv" ("id" character varying NOT NULL, "lltv" numeric NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_a65e362d4330952d03f3e589f96" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "create_market" ("id" character varying NOT NULL, "loan_token" text NOT NULL, "collateral_token" text NOT NULL, "oracle" text NOT NULL, "irm" text NOT NULL, "lltv" numeric NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_5b1ec662c2de0afc4fd2c1d1d8d" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "supply" ("id" character varying NOT NULL, "caller" text NOT NULL, "on_behalf" text NOT NULL, "assets" numeric NOT NULL, "shares" numeric NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_11dcdc2def0eb6d10ed3ae0180d" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "withdraw" ("id" character varying NOT NULL, "caller" text NOT NULL, "on_behalf" text NOT NULL, "receiver" text NOT NULL, "assets" numeric NOT NULL, "shares" numeric NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_5c172f81689173f75bf5906ef22" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "borrow" ("id" character varying NOT NULL, "caller" text NOT NULL, "on_behalf" text NOT NULL, "receiver" text NOT NULL, "assets" numeric NOT NULL, "shares" numeric NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_dff0c680b9c6fc99f5a20d67a97" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "repay" ("id" character varying NOT NULL, "caller" text NOT NULL, "on_behalf" text NOT NULL, "assets" numeric NOT NULL, "shares" numeric NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_5aa22c42125eb520c9b53579e0e" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "supply_collateral" ("id" character varying NOT NULL, "caller" text NOT NULL, "on_behalf" text NOT NULL, "assets" numeric NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_5b0598555d6df382f83651eab21" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "withdraw_collateral" ("id" character varying NOT NULL, "caller" text NOT NULL, "on_behalf" text NOT NULL, "receiver" text NOT NULL, "assets" numeric NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_60501d2c909658648adc08f231c" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "liquidate" ("id" character varying NOT NULL, "caller" text NOT NULL, "borrower" text NOT NULL, "repaid_assets" numeric NOT NULL, "repaid_shares" numeric NOT NULL, "seized_assets" numeric NOT NULL, "bad_debt_assets" numeric NOT NULL, "bad_debt_shares" numeric NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_0b9cb652672bbb7348df40ac522" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "flash_loan" ("id" character varying NOT NULL, "caller" text NOT NULL, "token" text NOT NULL, "assets" numeric NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_8006812becb0fc9ba4e62768284" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "set_authorization" ("id" character varying NOT NULL, "caller" text NOT NULL, "authorizer" text NOT NULL, "authorized" text NOT NULL, "new_is_authorized" boolean NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_2ad98c8c687e939e8145ecec68f" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "increment_nonce" ("id" character varying NOT NULL, "caller" text NOT NULL, "authorizer" text NOT NULL, "used_nonce" numeric NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_346b94b2d11245077fd4646e6b2" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "accrue_interest" ("id" character varying NOT NULL, "prev_borrow_rate" numeric NOT NULL, "interest" numeric NOT NULL, "fee_shares" numeric NOT NULL, "chain" integer NOT NULL, "block_number" integer NOT NULL, "block_timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_d92f8cb36ae06782c560628535a" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "asset" ("id" character varying NOT NULL, "symbol" text NOT NULL, "decimals" integer NOT NULL, CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY ("id"))`)
    }

    async down(db) {
        await db.query(`DROP TABLE "set_owner"`)
        await db.query(`DROP TABLE "set_fee"`)
        await db.query(`DROP TABLE "set_fee_recipient"`)
        await db.query(`DROP TABLE "enable_irm"`)
        await db.query(`DROP TABLE "enable_lltv"`)
        await db.query(`DROP TABLE "create_market"`)
        await db.query(`DROP TABLE "supply"`)
        await db.query(`DROP TABLE "withdraw"`)
        await db.query(`DROP TABLE "borrow"`)
        await db.query(`DROP TABLE "repay"`)
        await db.query(`DROP TABLE "supply_collateral"`)
        await db.query(`DROP TABLE "withdraw_collateral"`)
        await db.query(`DROP TABLE "liquidate"`)
        await db.query(`DROP TABLE "flash_loan"`)
        await db.query(`DROP TABLE "set_authorization"`)
        await db.query(`DROP TABLE "increment_nonce"`)
        await db.query(`DROP TABLE "accrue_interest"`)
        await db.query(`DROP TABLE "asset"`)
    }
}
