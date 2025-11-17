const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Modèle Produit - Gestion des produits du catalogue
 */
const Produit = sequelize.define('Produit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le nom du produit est requis'
      },
      len: {
        args: [2, 255],
        msg: 'Le nom doit contenir entre 2 et 255 caractères'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prix: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'Le prix doit être un nombre décimal'
      },
      min: {
        args: [0.01],
        msg: 'Le prix doit être supérieur à 0'
      }
    }
  },
  prix_promo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      isDecimal: {
        msg: 'Le prix promotionnel doit être un nombre décimal'
      },
      min: {
        args: [0.01],
        msg: 'Le prix promotionnel doit être supérieur à 0'
      }
    }
  },
    promotion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'La promotion doit être un nombre entier'
        },
        min: {
          args: [0],
          msg: 'La promotion ne peut pas être négative'
        },
        max: {
          args: [100],
          msg: 'La promotion ne peut pas dépasser 100%'
        }
      }
    },
  categorie: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La catégorie est requise'
      },
      isIn: {
        args: [['homme', 'femme', 'enfant', 'accessoires', 'autre']],
        msg: 'Catégorie invalide'
      }
    }
  },
  image_avant: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Image principale du produit (face avant)'
  },
  image_arriere: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Image du produit (face arrière)'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Tableau d\'URLs des images supplémentaires du produit'
  },
  stock: {
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
  en_rupture: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  est_nouveau: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  date_mise_a_jour: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'produits',
  timestamps: true,
  createdAt: 'date_creation',
  updatedAt: 'date_mise_a_jour',
  indexes: [
    {
      fields: ['categorie']
    },
    {
      fields: ['est_nouveau']
    },
    {
      fields: ['en_rupture']
    },
    {
      fields: ['prix']
    }
  ],
  hooks: {
    // Mettre en rupture automatiquement si stock = 0
    beforeSave: (produit) => {
      if (produit.stock === 0) {
        produit.en_rupture = true;
      }
    }
  }
});

module.exports = Produit;
