const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * Modèle User - Gestion des utilisateurs et admins
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: {
        args: [2, 100],
        msg: 'Le nom doit contenir entre 2 et 100 caractères'
      },
      notEmpty: {
        msg: 'Le nom est requis'
      }
    }
  },
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: {
        args: [2, 100],
        msg: 'Le prénom doit contenir entre 2 et 100 caractères'
      },
      notEmpty: {
        msg: 'Le prénom est requis'
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      msg: 'Cet email est déjà utilisé'
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
  mot_de_passe: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le mot de passe est requis'
      },
      len: {
        args: [8, 255],
        msg: 'Le mot de passe doit contenir au moins 8 caractères'
      }
    }
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      // Accept a broader range of phone numbers (not limited to Algerian format).
      // Keep a sensible length constraint so the field isn't abused.
      len: {
        args: [4, 20],
        msg: 'Le numéro de téléphone doit contenir entre 4 et 20 caractères'
      }
    }
  },
  adresse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ville: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  code_postal: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  est_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  est_actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  email_verifie: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  code_verification: {
    type: DataTypes.STRING(8),
    allowNull: true,
    validate: {
      len: {
        args: [8, 8],
        msg: 'Le code de vérification doit contenir exactement 8 chiffres'
      },
      isNumeric: {
        msg: 'Le code de vérification doit contenir uniquement des chiffres'
      }
    }
  },
  code_verification_expiration: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reset_password_code: {
    type: DataTypes.STRING(128),
    allowNull: true,
    comment: 'Hash du code de réinitialisation à 8 chiffres'
  },
  reset_password_expiration: {
    type: DataTypes.DATE,
    allowNull: true
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  derniere_connexion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'date_creation',
  updatedAt: 'updatedAt',
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['est_admin']
    },
    {
      fields: ['reset_password_code']
    }
  ],
  hooks: {
    // Hook avant la création d'un utilisateur - Hash du mot de passe
    beforeCreate: async (user) => {
      if (user.mot_de_passe) {
        const salt = await bcrypt.genSalt(10);
        user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, salt);
      }
    },
    // Hook avant la mise à jour - Hash du nouveau mot de passe si modifié
    beforeUpdate: async (user) => {
      if (user.changed('mot_de_passe')) {
        const salt = await bcrypt.genSalt(10);
        user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, salt);
      }
    }
  }
});

/**
 * Méthode pour comparer le mot de passe
 * @param {string} motDePasse - Mot de passe à vérifier
 * @returns {Promise<boolean>}
 */
User.prototype.comparePassword = async function(motDePasse) {
  return await bcrypt.compare(motDePasse, this.mot_de_passe);
};

/**
 * Méthode pour obtenir les informations publiques de l'utilisateur
 * @returns {object} - Informations utilisateur sans le mot de passe
 */
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.mot_de_passe;
  delete values.reset_password_code;
  delete values.reset_password_expiration;
  delete values.code_verification;
  delete values.code_verification_expiration;
  return values;
};

module.exports = User;
