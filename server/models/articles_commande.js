const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Commande = require('./commande');
const Produit = require('./produit');

/**
 * Modèle ArticlesCommande - Table de liaison entre Commande et Produit
 * Représente les articles contenus dans une commande
 */
const ArticlesCommande = sequelize.define('ArticlesCommande', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  commande_id: {
    type: DataTypes.INTEGER,
    allowNull: false
    // references, onDelete, onUpdate removed for PlanetScale/Vitess compatibility
    // Foreign key constraint disabled; relationship handled by Sequelize associations
  },
  produit_id: {
    type: DataTypes.INTEGER,
    allowNull: false
    // references, onDelete, onUpdate removed for PlanetScale/Vitess compatibility
    // Foreign key constraint disabled; relationship handled by Sequelize associations
  },
  // Informations au moment de la commande (snapshot)
  nom_produit: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nom du produit au moment de la commande'
  },
  prix_unitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'Le prix unitaire doit être un nombre décimal'
      },
      min: {
        args: [0.01],
        msg: 'Le prix unitaire doit être supérieur à 0'
      }
    },
    comment: 'Prix au moment de la commande'
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: {
        msg: 'La quantité doit être un nombre entier'
      },
      min: {
        args: [1],
        msg: 'La quantité doit être au moins 1'
      }
    }
  },
  taille: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Taille choisie (si applicable)'
  },
  couleur: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Couleur choisie (si applicable)'
  },
  sous_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'Le sous-total doit être un nombre décimal'
      },
      min: {
        args: [0.01],
        msg: 'Le sous-total doit être supérieur à 0'
      }
    },
    comment: 'prix_unitaire * quantite'
  }
}, {
  tableName: 'articles_commande',
  timestamps: false,
  indexes: [
    {
      fields: ['commande_id']
    },
    {
      fields: ['produit_id']
    }
  ],
  hooks: {
    // Calculer automatiquement le sous-total avant création
    beforeCreate: (article) => {
      article.sous_total = (parseFloat(article.prix_unitaire) * parseInt(article.quantite)).toFixed(2);
    },
    beforeUpdate: (article) => {
      if (article.changed('prix_unitaire') || article.changed('quantite')) {
        article.sous_total = (parseFloat(article.prix_unitaire) * parseInt(article.quantite)).toFixed(2);
      }
    }
  }
});

// Relations: Commande a plusieurs articles
Commande.hasMany(ArticlesCommande, {
  foreignKey: 'commande_id',
  as: 'articles',
  constraints: false  // Disable FK creation for PlanetScale/Vitess
  // onDelete removed - PlanetScale doesn't support FK constraints
});

ArticlesCommande.belongsTo(Commande, {
  foreignKey: 'commande_id',
  as: 'commande',
  constraints: false  // Disable FK creation for PlanetScale/Vitess
});

// Relations: Produit peut être dans plusieurs commandes
Produit.hasMany(ArticlesCommande, {
  foreignKey: 'produit_id',
  as: 'articles_commande',
  constraints: false  // Disable FK creation for PlanetScale/Vitess
});

ArticlesCommande.belongsTo(Produit, {
  foreignKey: 'produit_id',
  as: 'produit',
  constraints: false  // Disable FK creation for PlanetScale/Vitess
});

module.exports = ArticlesCommande;
