const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Produit = require('./produit');

/**
 * Modèle CouleursProduits - Gestion des couleurs disponibles pour chaque produit
 * Relation: Un produit peut avoir plusieurs couleurs
 */
const CouleursProduits = sequelize.define('CouleursProduits', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  produit_id: {
    type: DataTypes.INTEGER,
    allowNull: false
    // references, onDelete, onUpdate removed for PlanetScale/Vitess compatibility
    // Foreign key constraint disabled; relationship handled by Sequelize associations
  },
  couleur: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La couleur est requise'
      },
      len: {
        args: [2, 50],
        msg: 'La couleur doit contenir entre 2 et 50 caractères'
      }
    }
  },
  code_hexa: {
    type: DataTypes.STRING(7),
    allowNull: true,
    validate: {
      is: {
        args: /^#[0-9A-Fa-f]{6}$/,
        msg: 'Le code hexadécimal doit être au format #RRGGBB'
      }
    },
    comment: 'Code couleur hexadécimal (ex: #FF5733)'
  },
  stock_couleur: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isInt: {
        msg: 'Le stock doit être un nombre entier'
      },
      min: {
        args: [0],
        msg: 'Le stock ne peut pas être négatif'
      }
    }
  }
}, {
  tableName: 'couleurs_produits',
  timestamps: false,
  indexes: [
    {
      fields: ['produit_id']
    },
    {
      unique: true,
      fields: ['produit_id', 'couleur']
    }
  ]
});

// Relation: Produit a plusieurs couleurs
Produit.hasMany(CouleursProduits, {
  foreignKey: 'produit_id',
  as: 'couleurs',
  constraints: false  // Disable FK creation for PlanetScale/Vitess
  // onDelete removed - PlanetScale doesn't support FK constraints
});

CouleursProduits.belongsTo(Produit, {
  foreignKey: 'produit_id',
  as: 'produit',
  constraints: false  // Disable FK creation for PlanetScale/Vitess
});

module.exports = CouleursProduits;
