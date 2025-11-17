const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Modèle Newsletter - Gestion des inscriptions à la newsletter
 */
const Newsletter = sequelize.define('Newsletter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      msg: 'Cet email est déjà inscrit à la newsletter'
    },
    validate: {
      isEmail: {
        msg: 'Format d\'email invalide'
      },
      notEmpty: {
        msg: 'L\'email est requis'
      }
    }
  },
  est_actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'True si l\'abonné est actif, False s\'il s\'est désinscrit'
  },
  date_inscription: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  date_desinscription: {
    type: DataTypes.DATE,
    allowNull: true
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Source d\'inscription: homepage, checkout, popup, etc.'
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Préférences de l\'abonné en JSON'
  }
}, {
  tableName: 'newsletter',
  timestamps: true,
  createdAt: 'date_inscription',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['est_actif']
    },
    {
      fields: ['date_inscription']
    }
  ]
});

module.exports = Newsletter;
