const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user');

/**
 * Modèle Commande - Gestion des commandes clients
 */
const Commande = sequelize.define('Commande', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    // references, onDelete, onUpdate removed for PlanetScale/Vitess compatibility
    // Foreign key constraint disabled; relationship handled by Sequelize associations
    comment: 'NULL si commande passée sans compte'
  },
  // Informations client (obligatoires même pour utilisateurs connectés)
  nom_complet: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le nom complet est requis'
      },
      len: {
        args: [2, 200],
        msg: 'Le nom complet doit contenir entre 2 et 200 caractères'
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Format d\'email invalide'
      },
      notEmpty: {
        msg: 'L\'email est requis'
      }
    }
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le téléphone est requis'
      },
      // Relax Algerian-specific format: accept general phone numbers with sensible length
      len: {
        args: [4, 20],
        msg: 'Le numéro de téléphone doit contenir entre 4 et 20 caractères'
      }
    }
  },
  adresse_livraison: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'L\'adresse de livraison est requise'
      }
    }
  },
  ville: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La ville est requise'
      }
    }
  },
  code_postal: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  wilaya: {
    type: DataTypes.ENUM(
      'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
      'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
      'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
      'Constantine', 'Médéa', 'Mostaganem', "M'Sila", 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
      'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
      'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
      'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
      'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', "El M'Ghair", 'El Meniaa'
    ),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La wilaya est requise'
      }
    }
  },
  // Informations de livraison
  methode_livraison: {
    type: DataTypes.ENUM('domicile', 'yalidine', 'guepex'),
    allowNull: true,
    defaultValue: null,
    validate: {
      isIn: {
        args: [['domicile', 'yalidine', 'guepex']],
        msg: 'Méthode de livraison invalide'
      }
    }
  },
  // Mode de livraison (optionnel): express ou economic
  mode_livraison: {
    type: DataTypes.ENUM('express', 'economic'),
    allowNull: true,
    defaultValue: null,
    validate: {
      isIn: {
        args: [['express', 'economic']],
        msg: 'Mode de livraison invalide'
      }
    },
    comment: 'Mode de livraison: express ou economic (optionnel)'
  },
  frais_livraison: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      isDecimal: {
        msg: 'Les frais de livraison doivent être un nombre décimal'
      },
      min: {
        args: [0],
        msg: 'Les frais de livraison ne peuvent pas être négatifs'
      }
    }
  },
  // Montants
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
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'Le total doit être un nombre décimal'
      },
      min: {
        args: [0.01],
        msg: 'Le total doit être supérieur à 0'
      }
    }
  },
  // Prix éventuellement fourni par le client (optionnel)
  prix_soumis: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: null,
    validate: {
      isDecimal: {
        msg: 'Le prix soumis doit être un nombre décimal'
      },
      min: {
        args: [0],
        msg: 'Le prix soumis ne peut pas être négatif'
      }
    },
    comment: 'Prix fourni par le client (optionnel)'
  },
  // Statut et suivi
  statut: {
    type: DataTypes.ENUM('en_attente', 'confirmee', 'expediee', 'livree', 'annulee'),
    allowNull: false,
    defaultValue: 'en_attente',
    validate: {
      isIn: {
        args: [['en_attente', 'confirmee', 'expediee', 'livree', 'annulee']],
        msg: 'Statut invalide'
      }
    },
    comment: 'en_attente: nouvelle commande | confirmee: admin a confirmé | expediee: en cours de livraison | livree: reçue | annulee: annulée'
  },
  numero_suivi: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Numéro de suivi du transporteur'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes du client ou de l\'admin'
  },
  facture: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL du fichier PDF de la facture'
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
  },
  date_livraison: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'commandes',
  timestamps: true,
  createdAt: 'date_creation',
  updatedAt: 'date_mise_a_jour',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['statut']
    },
    {
      fields: ['email']
    },
    {
      fields: ['date_creation']
    },
    {
      fields: ['numero_suivi']
    }
  ]
});

// Relation: User a plusieurs commandes
User.hasMany(Commande, {
  foreignKey: 'user_id',
  as: 'commandes',
  constraints: false  // Disable FK creation for PlanetScale/Vitess
});

Commande.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  constraints: false  // Disable FK creation for PlanetScale/Vitess
});

module.exports = Commande;
