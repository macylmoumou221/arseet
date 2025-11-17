/**
 * Index des modèles - Point d'entrée pour tous les modèles Sequelize
 * Gère les relations entre les modèles
 */

const User = require('./user');
const Produit = require('./produit');
const CouleursProduits = require('./couleurs_produits');
const TaillesProduits = require('./tailles_produits');
const Commande = require('./commande');
const ArticlesCommande = require('./articles_commande');
const Newsletter = require('./newsletter');

// Export de tous les modèles
module.exports = {
  User,
  Produit,
  CouleursProduits,
  TaillesProduits,
  Commande,
  ArticlesCommande,
  Newsletter
};
