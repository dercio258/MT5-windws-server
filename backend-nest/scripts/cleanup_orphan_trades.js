const { Client } = require('pg');
const { createClient } = require('@clickhouse/client');
require('dotenv').config();

async function cleanup() {
  console.log('--- Starting ClickHouse and PostgreSQL sync & orphan purge ---');
  
  const pgClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });
  await pgClient.connect();

  const chClient = createClient({
    url: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
    database: process.env.CLICKHOUSE_DATABASE || 'default'
  });

  // 1. Fetch valid trade IDs from PostgreSQL
  const pgTradesRes = await pgClient.query('SELECT id, account_id, ticket FROM trades');
  const pgTrades = pgTradesRes.rows;
  console.log(`Found ${pgTrades.length} valid trades in PostgreSQL.`);
  const validPgIds = new Set(pgTrades.map(t => t.id));

  // 2. Fetch all trade IDs from ClickHouse
  const chTradesRes = await chClient.query({
    query: 'SELECT id, accountId, ticket, importLogId FROM trades',
    format: 'JSONEachRow'
  });
  const chTrades = await chTradesRes.json();
  console.log(`Found ${chTrades.length} total trades in ClickHouse.`);

  // 3. Find orphan trades in ClickHouse
  const orphanTrades = chTrades.filter(t => !validPgIds.has(t.id));
  console.log(`Identified ${orphanTrades.length} orphan trades in ClickHouse to be purged.`);

  if (orphanTrades.length > 0) {
    const orphanIds = orphanTrades.map(t => t.id);
    const chunkSize = 200;
    for (let i = 0; i < orphanIds.length; i += chunkSize) {
      const chunk = orphanIds.slice(i, i + chunkSize);
      console.log(`Deleting chunk ${Math.floor(i / chunkSize) + 1} (${chunk.length} trades)...`);
      await chClient.command({
        query: `ALTER TABLE trades DELETE WHERE id IN ({ids:Array(String)})`,
        query_params: { ids: chunk }
      });
    }

    console.log('Waiting 2 seconds for mutations to finalize...');
    await new Promise(r => setTimeout(r, 2000));
  }

  // 4. Verify post-cleanup state
  const chFinalRes = await chClient.query({
    query: 'SELECT count(*) as count FROM trades',
    format: 'JSONEachRow'
  });
  const chFinalCount = await chFinalRes.json();
  console.log('Post-cleanup ClickHouse trades count:', chFinalCount);

  await pgClient.end();
  await chClient.close();
  console.log('--- Cleanup complete! ---');
}

cleanup().catch(err => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
