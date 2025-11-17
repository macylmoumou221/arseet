#!/usr/bin/env node
// Quick script to test Sequelize DB connection using the project's config
// Usage: node scripts/test-db-connection.js

const { testConnection, sequelize } = require('../config/db');
require('dotenv').config();

const redact = (s) => (s ? '[REDACTED]' : '[EMPTY]');

(async () => {
  try {
    console.log('--- DB connection debug ---');
    console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
    console.log('DB_PORT:', process.env.DB_PORT || '3306');
    console.log('DB_NAME:', process.env.DB_NAME || '(default)');
    console.log('DB_USER:', process.env.DB_USER || '(default)');
    console.log('DB_SSL:', process.env.DB_SSL || 'false');
    console.log('DB_SSL_REJECT_UNAUTHORIZED:', process.env.DB_SSL_REJECT_UNAUTHORIZED || 'undefined');
    console.log('DB_CA_PATH:', process.env.DB_CA_PATH ? process.env.DB_CA_PATH : 'none');
    console.log('DB_CA_CERT present:', process.env.DB_CA_CERT ? 'yes' : 'no');
    console.log('---------------------------');

    const ok = await testConnection();
    if (ok) {
      console.log('\n✅ Test connection succeeded');
    } else {
      console.error('\n❌ Test connection failed - see logs above for details');
    }

    // Close the sequelize connection cleanly
    await sequelize.close();
    process.exit(ok ? 0 : 1);
  } catch (err) {
    console.error('Unexpected error while testing DB connection:', err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    try { await sequelize.close(); } catch (e) {}
    process.exit(1);
  }
})();
