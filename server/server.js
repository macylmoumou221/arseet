require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { testConnection, syncDatabase } = require('./config/db');
require('./config/firebase'); // Initialize Firebase
const { 
  notFound, 
  errorHandler, 
  sequelizeErrorHandler,
  multerErrorHandler
} = require('./middlewares/errorHandler');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const produitsRoutes = require('./routes/produitsRoutes');
const commandesRoutes = require('./routes/commandesRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const adminRoutes = require('./routes/adminRoutes');
const utilsRoutes = require('./routes/utilsRoutes');
const { sendContactMessage } = require('./controllers/contactController');

// Initialisation de l'application Express
const app = express();

// ============================================
// MIDDLEWARES GLOBAUX
// ============================================

// Sécurité HTTP avec Helmet
app.use(helmet());

// CORS - Autoriser les requêtes depuis le frontend
// Supporte une ou plusieurs origines via la variable FRONTEND_URL (séparées par des virgules)
// et autorise explicitement https://arseet.com
const rawFrontend = process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigins = rawFrontend.split(',').map(s => s.trim()).filter(Boolean);
// Ensure production domain is allowed (idempotent)
if (!allowedOrigins.includes('https://arseet.com')) {
  allowedOrigins.push('https://arseet.com');
}

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Parsing des requêtes JSON et URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging des requêtes HTTP en développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting - Protection contre les attaques DDoS
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes par défaut
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requêtes par défaut
  message: {
    success: false,
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Appliquer le rate limiting à toutes les routes
app.use('/api/', limiter);

// ============================================
// ROUTES
// ============================================

// Route de bienvenue
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur l\'API Arseet E-commerce',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      produits: '/api/produits',
      commandes: '/api/commandes',
      newsletter: '/api/newsletter',
      admin: '/api/admin',
      utils: '/api/utils'
    },
    documentation: '/api/docs'
  });
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/produits', produitsRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/utils', utilsRoutes);

// Compatibility route: expose POST /api/contact directly (some clients expect this path)
app.post('/api/contact', sendContactMessage);

// ============================================
// GESTION DES ERREURS
// ============================================

// Route 404 - Non trouvée
app.use(notFound);

// Gestionnaire d'erreurs Multer
app.use(multerErrorHandler);

// Gestionnaire d'erreurs Sequelize
app.use(sequelizeErrorHandler);

// Gestionnaire d'erreurs global
app.use(errorHandler);

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Tester la connexion à la base de données avec retries (utile en Docker Compose)
    const maxRetries = parseInt(process.env.DB_CONNECT_RETRIES || '10');
    const retryDelayMs = parseInt(process.env.DB_CONNECT_RETRY_DELAY_MS || '3000');
    let attempts = 0;
    let dbConnected = false;

    while (attempts < maxRetries) {
      attempts++;
      console.log(`🔁 DB connection attempt ${attempts}/${maxRetries}...`);
      // eslint-disable-next-line no-await-in-loop
      dbConnected = await testConnection();
      if (dbConnected) break;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, retryDelayMs));
    }

    if (!dbConnected) {
      console.error('❌ Impossible de se connecter à la base de données après plusieurs tentatives');
      process.exit(1);
    }

    // Synchroniser les modèles avec la base de données
    // ATTENTION: Ne jamais utiliser force: true en production!
    await syncDatabase(process.env.NODE_ENV === 'development' && process.env.DB_FORCE_SYNC === 'true');

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log('');
      console.log('========================================');
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📚 API: http://localhost:${PORT}/api`);
      console.log('========================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée (Promise rejection):', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non capturée (Exception):', err);
  process.exit(1);
});

module.exports = app;
