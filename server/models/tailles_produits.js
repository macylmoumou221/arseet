const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Produit = require('./produit');

/**
 * Modèle TaillesProduits - Gestion des tailles disponibles pour chaque produit
 * Relation: Un produit peut avoir plusieurs tailles
 */
const TaillesProduits = sequelize.define('TaillesProduits', {
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
  taille: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La taille est requise'
      },
      len: {
        args: [1, 20],
        msg: 'La taille doit contenir entre 1 et 20 caractères'
      }
    },
    comment: 'Ex: XS, S, M, L, XL, XXL, 38, 40, 42, etc.'
  },
  stock_taille: {
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
  },
  mesures: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Mesures en JSON: {"longueur": 70, "largeur": 50, "unite": "cm"}'
  }
}, {
  tableName: 'tailles_produits',
  timestamps: false,
  indexes: [
    {
      fields: ['produit_id']
    },
    {
      unique: true,
      fields: ['produit_id', 'taille']
    }
  ]
});

// Relation: Produit a plusieurs tailles
Produit.hasMany(TaillesProduits, {
  foreignKey: 'produit_id',
  as: 'tailles',
  constraints: false  // Disable FK creation for PlanetScale/Vitess
  // onDelete removed - PlanetScale doesn't support FK constraints
});

TaillesProduits.belongsTo(Produit, {
  foreignKey: 'produit_id',
  as: 'produit',
  constraints: false  // Disable FK creation for PlanetScale/Vitess
});

module.exports = TaillesProduits;
