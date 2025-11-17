const { Sequelize } = require('sequelize');
require('dotenv').config();
const fs = require('fs');

/**
 * Configuration de la connexion à la base de données MySQL via Sequelize
 */
// Build dialectOptions conditionally so we can support SSL for managed DBs
const dialectOptions = {
  charset: 'utf8mb4'
};

// Auto-detect certain managed DB hosts and enable DB_SSL by default if not set.
const dbHost = (process.env.DB_HOST || '').toLowerCase();
if (!process.env.DB_SSL) {
  if (dbHost.includes('psdb.cloud') || dbHost.includes('neon.tech') || dbHost.includes('db.ondigitalocean.com') || dbHost.includes('rds.amazonaws') || dbHost.includes('db.cloudflare')) {
    // Auto-enable SSL for known managed DB host patterns to reduce friction during setup.
    process.env.DB_SSL = 'true';
    // For quick compatibility, default to allowing self-signed certs unless the user opts in.
    if (!process.env.DB_SSL_REJECT_UNAUTHORIZED) process.env.DB_SSL_REJECT_UNAUTHORIZED = 'false';
    console.log(`⚠️ Auto-enabled DB_SSL for host ${dbHost} (set DB_SSL in env to override)`);
  }
}

// If DB_SSL=true, enable SSL/TLS on the client side. Useful for managed DB providers
// that require encrypted connections. For self-signed certs you can set
// DB_SSL_REJECT_UNAUTHORIZED=false (not recommended for production), or provide
// DB_CA_CERT with the CA PEM contents.
if (process.env.DB_SSL === 'true') {
  dialectOptions.ssl = {
    // Require TLS on the client side when DB_SSL=true
    require: true,
    // mysql2/Sequelize expects an object for `ssl` when using TLS
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  };

  if (process.env.DB_CA_CERT) {
    // Allow passing the CA PEM as an env var. If newlines are escaped, convert them.
    const ca = process.env.DB_CA_CERT.includes('\n')
      ? process.env.DB_CA_CERT
      : process.env.DB_CA_CERT.replace(/\\n/g, '\n');
    dialectOptions.ssl.ca = ca;
  }

  // Also support passing a path to a CA file (useful when running locally or in Docker)
  if (process.env.DB_CA_PATH) {
    try {
      const caFromFile = fs.readFileSync(process.env.DB_CA_PATH, 'utf8');
      dialectOptions.ssl.ca = caFromFile;
    } catch (err) {
      console.warn('⚠️ Could not read DB_CA_PATH file, proceeding without it:', err.message);
    }
  }
}

if (process.env.DB_SSL === 'true') {
  console.log('🔐 DB SSL is enabled for Sequelize client connections');
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'arseet_ecommerce',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions,
    define: {
      charset: 'utf8mb4',
      timestamps: true,
      underscored: false,
      // Disable FK constraint creation for PlanetScale/Vitess (VT10001 error)
      // PlanetScale doesn't support foreign keys at DB level; associations still work in app
      freezeTableName: false
    }
  }
);

/**
 * Test de la connexion à la base de données
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à MySQL réussie');
    return true;
  } catch (error) {
    // Print more context for debugging remote connections (include stack and original error if present)
    console.error('❌ Erreur de connexion à MySQL:', error && error.message ? error.message : error);
    if (error && error.stack) console.error(error.stack);
    if (error && error.original) console.error('Original error from dialect:', error.original);
    return false;
  }
};

/**
 * Synchronisation des modèles avec la base de données
 * @param {boolean} force - Si true, supprime et recrée les tables
 */
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force && process.env.NODE_ENV === 'development' });
    console.log(`✅ Base de données synchronisée ${force ? '(tables recréées)' : ''}`);
  } catch (error) {
    console.error('❌ Erreur de synchronisation:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};
