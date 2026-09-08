require('dotenv').config({ path: 'e:/TRADING COSSA/backend-nest/.env' });
const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });
  await client.connect();

  console.log('--- Applying Economic Calendar Migration ---');
  
  // 1. Drop old 0-row economic_events table if exists
  await client.query('DROP TABLE IF EXISTS economic_events CASCADE');

  // 2. Create new economic_events table
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

  // 3. Create indices
  await client.query('CREATE INDEX IF NOT EXISTS idx_economic_events_date ON economic_events(event_date ASC)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_economic_events_currency ON economic_events(currency)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_economic_events_impact ON economic_events(impact)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_economic_events_category ON economic_events(category)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_economic_events_status ON economic_events(status)');

  // 4. Create economic_event_history table
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
  await client.query('CREATE INDEX IF NOT EXISTS idx_economic_event_history_event_id ON economic_event_history(event_id)');

  console.log('✅ Tables economic_events and economic_event_history created successfully with all indices!');

  // Check columns
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'economic_events'
    ORDER BY ordinal_position
  `);
  console.log('New economic_events columns:', res.rows.map(r => `${r.column_name} (${r.data_type})`));

  await client.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
