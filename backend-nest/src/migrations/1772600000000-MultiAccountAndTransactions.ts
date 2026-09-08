import { MigrationInterface, QueryRunner } from "typeorm";

export class MultiAccountAndTransactions1772600000000 implements MigrationInterface {
    name = 'MultiAccountAndTransactions1772600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add new columns to accounts
        await queryRunner.query(`ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "name" character varying NOT NULL DEFAULT 'Conta Principal'`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "broker" character varying NOT NULL DEFAULT 'MetaTrader 5'`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "type" character varying(20) NOT NULL DEFAULT 'live'`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "currency" character varying(10) NOT NULL DEFAULT 'USD'`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "initial_balance" numeric(15,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "is_primary" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "is_archived" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "archived_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "prop_firm_rules" jsonb`);

        // 2. Ensure uuid-ossp extension is enabled
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // 3. Create account_transactions table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "account_transactions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "account_id" uuid NOT NULL,
                "type" character varying(20) NOT NULL DEFAULT 'deposit',
                "amount" numeric(15,2) NOT NULL,
                "date" TIMESTAMP NOT NULL DEFAULT now(),
                "description" text,
                "balance_after" numeric(15,2) NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_account_transactions" PRIMARY KEY ("id")
            )
        `);

        // 4. Create foreign key and index
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_account_transactions_account'
                ) THEN
                    ALTER TABLE "account_transactions" 
                    ADD CONSTRAINT "FK_account_transactions_account" 
                    FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE;
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_account_transactions_account_id" ON "account_transactions" ("account_id")
        `);

        // 5. Populate app_token for any accounts missing it
        await queryRunner.query(`
            UPDATE "accounts" 
            SET "app_token" = upper(replace(uuid_generate_v4()::text, '-', '')) 
            WHERE "app_token" IS NULL OR "app_token" = ''
        `);

        // 6. Set initial_balance = balance for existing accounts if initial_balance is 0
        await queryRunner.query(`
            UPDATE "accounts" 
            SET "initial_balance" = "balance" 
            WHERE "initial_balance" = 0 AND "balance" > 0
        `);

        // 7. Ensure is_primary is set for at least one account per user
        await queryRunner.query(`
            WITH ranked_accounts AS (
                SELECT id, user_id, 
                       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY "createdAt" ASC) as rn
                FROM "accounts"
                WHERE "user_id" IS NOT NULL
            )
            UPDATE "accounts"
            SET "is_primary" = (ranked_accounts.rn = 1)
            FROM ranked_accounts
            WHERE "accounts".id = ranked_accounts.id;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "account_transactions"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN IF EXISTS "prop_firm_rules"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN IF EXISTS "archived_at"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN IF EXISTS "is_archived"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN IF EXISTS "is_primary"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN IF EXISTS "initial_balance"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN IF EXISTS "currency"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN IF EXISTS "type"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN IF EXISTS "broker"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN IF EXISTS "name"`);
    }
}
