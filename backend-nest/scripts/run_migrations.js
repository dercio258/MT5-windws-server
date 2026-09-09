/**
 * Torex Journal - Unified Production Database Migration Runner
 * Safe, idempotent, and standalone. Runs directly with `node scripts/run_migrations.js`.
 */

const path = require('path');

// Resolve .env from multiple potential execution contexts
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
require('dotenv').config({ path: path.resolve(process.cwd(), 'backend-nest/.env') });

const { Client } = require('pg');

async function runMigrations() {
    console.log('====================================================');
    console.log('🚀 TOREX JOURNAL - DATABASE MIGRATION RUNNER');
    console.log('====================================================');

    const user = process.env.DB_USER;
    const password = process.env.DB_PASS;
    const database = process.env.DB_NAME;
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = parseInt(process.env.DB_PORT || '5432');

    if (!user || !password || !database) {
        console.error('❌ Missing database credentials in environment variables.');
        console.error('Resolved config:', { host, port, user: user || '<undefined>', database: database || '<undefined>' });
        console.error('Please ensure .env contains DB_USER, DB_PASS, and DB_NAME.');
        process.exit(1);
    }

    console.log(`🔌 Connecting to PostgreSQL at ${host}:${port}/${database} as "${user}"...`);

    const client = new Client({
        host,
        port,
        user,
        password,
        database
    });

    try {
        await client.connect();
        console.log('✅ Connected successfully to PostgreSQL.');
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }

    try {
        console.log('\n--- 1. Extensions ---');
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        console.log('✓ uuid-ossp & pgcrypto extensions verified.');

        console.log('\n--- 2. Multi-Account Columns on "accounts" ---');
        await client.query(`ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "name" character varying NOT NULL DEFAULT 'Conta Principal'`);
        await client.query(`ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "broker" character varying NOT NULL DEFAULT 'MetaTrader 5'`);
        await client.query(`ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "type" character varying(20) NOT NULL DEFAULT 'live'`);
        await client.query(`ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "currency" character varying(10) NOT NULL DEFAULT 'USD'`);
        await client.query(`ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "initial_balance" numeric(15,2) NOT NULL DEFAULT 0`);
        await client.query(`ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "is_primary" boolean NOT NULL DEFAULT true`);
        await querySafe(client, `ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "is_archived" boolean NOT NULL DEFAULT false`);
        await querySafe(client, `ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "archived_at" TIMESTAMP`);
        await querySafe(client, `ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "prop_firm_rules" jsonb`);
        await querySafe(client, `ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "app_token" character varying(64)`);
        console.log('✓ "accounts" columns verified.');

        console.log('\n--- 3. "account_transactions" Table ---');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "account_transactions" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
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

        await querySafe(client, `
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

        await querySafe(client, `CREATE INDEX IF NOT EXISTS "IDX_account_transactions_account_id" ON "account_transactions" ("account_id")`);
        console.log('✓ "account_transactions" table, foreign key and index verified.');

        console.log('\n--- 4. Accounts Data Normalization ---');
        await querySafe(client, `
            UPDATE "accounts" 
            SET "app_token" = upper(replace(gen_random_uuid()::text, '-', '')) 
            WHERE "app_token" IS NULL OR "app_token" = ''
        `);
        await querySafe(client, `
            UPDATE "accounts" 
            SET "initial_balance" = "balance" 
            WHERE "initial_balance" = 0 AND "balance" > 0
        `);
        await querySafe(client, `
            WITH ranked_accounts AS (
                SELECT id, user_id, 
                       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY "createdAt" ASC) as rn
                FROM "accounts"
                WHERE "user_id" IS NOT NULL
            )
            UPDATE "accounts"
            SET "is_primary" = (ranked_accounts.rn = 1)
            FROM ranked_accounts
            WHERE "accounts".id = ranked_accounts.id AND ("accounts"."is_primary" IS NULL);
        `);
        console.log('✓ Account app_tokens, initial balances and primary flags normalized.');

        console.log('\n--- 5. "trades" Table Columns ---');
        await querySafe(client, `ALTER TABLE "trades" ADD COLUMN IF NOT EXISTS "import_log_id" integer`);
        await querySafe(client, `ALTER TABLE "trades" ADD COLUMN IF NOT EXISTS "entrySpot" numeric(10,5)`);
        await querySafe(client, `ALTER TABLE "trades" ADD COLUMN IF NOT EXISTS "exitSpot" numeric(10,5)`);
        await querySafe(client, `ALTER TABLE "trades" ADD COLUMN IF NOT EXISTS "buyPrice" numeric(10,2)`);
        await querySafe(client, `ALTER TABLE "trades" ADD COLUMN IF NOT EXISTS "sellPrice" numeric(10,2)`);
        await querySafe(client, `ALTER TABLE "trades" ADD COLUMN IF NOT EXISTS "payout" numeric(10,2)`);
        await querySafe(client, `ALTER TABLE "trades" ADD COLUMN IF NOT EXISTS "syntheticTxid" boolean NOT NULL DEFAULT false`);
        console.log('✓ "trades" columns verified.');

        console.log('\n--- 6. Economic Calendar Tables ---');
        await client.query(`
            CREATE TABLE IF NOT EXISTS economic_events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                event_date TIMESTAMPTZ NOT NULL,
                currency VARCHAR(10) NOT NULL,
                country VARCHAR(100),
                title VARCHAR(255) NOT NULL,
                category VARCHAR(50) NOT NULL DEFAULT 'OTHER',
                impact VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
                status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
                actual VARCHAR(50),
                forecast VARCHAR(50),
                previous VARCHAR(50),
                unit VARCHAR(30),
                description TEXT,
                source VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        await querySafe(client, 'CREATE INDEX IF NOT EXISTS idx_economic_events_date ON economic_events(event_date ASC)');
        await querySafe(client, 'CREATE INDEX IF NOT EXISTS idx_economic_events_currency ON economic_events(currency)');
        await querySafe(client, 'CREATE INDEX IF NOT EXISTS idx_economic_events_impact ON economic_events(impact)');
        await querySafe(client, 'CREATE INDEX IF NOT EXISTS idx_economic_events_category ON economic_events(category)');
        await querySafe(client, 'CREATE INDEX IF NOT EXISTS idx_economic_events_status ON economic_events(status)');

        await client.query(`
            CREATE TABLE IF NOT EXISTS economic_event_history (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                event_id UUID NOT NULL,
                action VARCHAR(30) NOT NULL,
                changed_by VARCHAR(150),
                old_data JSONB,
                new_data JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);
        await querySafe(client, 'CREATE INDEX IF NOT EXISTS idx_economic_event_history_event_id ON economic_event_history(event_id)');
        console.log('✓ "economic_events" and "economic_event_history" tables and indices verified.');

        console.log('\n--- 7. Leaderboard & Backtest Tables ---');
        await querySafe(client, `
            CREATE TABLE IF NOT EXISTS leaderboard_ranks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                rank INT NOT NULL DEFAULT 999,
                echelon VARCHAR(50) NOT NULL DEFAULT 'BRONZE',
                composite_score NUMERIC(5,2) NOT NULL DEFAULT 0,
                total_pnl NUMERIC(15,2) NOT NULL DEFAULT 0,
                win_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
                profit_factor NUMERIC(8,2) NOT NULL DEFAULT 0,
                trades_count INT NOT NULL DEFAULT 0,
                win_streak INT NOT NULL DEFAULT 0,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);
        await querySafe(client, 'CREATE INDEX IF NOT EXISTS idx_leaderboard_ranks_user_id ON leaderboard_ranks(user_id)');
        await querySafe(client, 'CREATE INDEX IF NOT EXISTS idx_leaderboard_ranks_rank ON leaderboard_ranks(rank ASC)');

        console.log('\n--- 8. Deriv Integration Tables ---');
        await querySafe(client, `
            CREATE TABLE IF NOT EXISTS "deriv_auth" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "userId" character varying NOT NULL,
                "account_id" character varying NOT NULL,
                "encryptedToken" text NOT NULL,
                "currency" character varying,
                "isActive" boolean NOT NULL DEFAULT true,
                "metadata" jsonb,
                "account_entity_id" character varying,
                "last_sync_at" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_deriv_auth" PRIMARY KEY ("id")
            );
        `);
        await querySafe(client, `ALTER TABLE "deriv_auth" ADD COLUMN IF NOT EXISTS "account_entity_id" character varying`);
        await querySafe(client, `ALTER TABLE "deriv_auth" ADD COLUMN IF NOT EXISTS "last_sync_at" TIMESTAMP`);

        await querySafe(client, `
            CREATE TABLE IF NOT EXISTS "deriv_transactions" (
                "transactionId" character varying NOT NULL,
                "contractId" character varying,
                "userId" character varying NOT NULL,
                "action" character varying,
                "amount" numeric(20,2) NOT NULL,
                "balance" numeric(20,2),
                "currency" character varying(10),
                "transactionTime" TIMESTAMP NOT NULL,
                "processed" boolean NOT NULL DEFAULT false,
                "raw" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_deriv_transactions" PRIMARY KEY ("transactionId")
            );
        `);
        await querySafe(client, 'CREATE INDEX IF NOT EXISTS "IDX_deriv_transactions_contractId" ON "deriv_transactions" ("contractId")');
        console.log('✓ "deriv_auth" and "deriv_transactions" verified.');

        // Mark TypeORM migrations table if exists
        await querySafe(client, `
            CREATE TABLE IF NOT EXISTS "migrations" (
                "id" SERIAL PRIMARY KEY,
                "timestamp" bigint NOT NULL,
                "name" character varying NOT NULL
            );
        `);
        await registerMigration(client, 1772600000000, 'MultiAccountAndTransactions1772600000000');
        await registerMigration(client, 1772529444375, 'AddImportLogId1772529444375');
        await registerMigration(client, 1772465278897, 'DerivRefactoring1772465278897');

        console.log('\n====================================================');
        console.log('🎉 ALL DATABASE MIGRATIONS COMPLETED SUCCESSFULLY!');
        console.log('====================================================');
    } catch (err) {
        console.error('\n❌ Migration failed with error:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

async function querySafe(client, sql) {
    try {
        await client.query(sql);
    } catch (err) {
        // Silently tolerate if duplicate constraint/index or column exists
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
            console.warn('Notice:', err.message);
        }
    }
}

async function registerMigration(client, timestamp, name) {
    try {
        const check = await client.query('SELECT 1 FROM "migrations" WHERE "name" = $1', [name]);
        if (check.rows.length === 0) {
            await client.query('INSERT INTO "migrations" ("timestamp", "name") VALUES ($1, $2)', [timestamp, name]);
            console.log(`✓ Migration "${name}" registered in "migrations" table.`);
        }
    } catch (err) {
        // Table might not exist or be accessible, non-critical
    }
}

runMigrations();
