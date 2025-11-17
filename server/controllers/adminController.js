const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('../models/user');
const Commande = require('../models/commande');
const ArticlesCommande = require('../models/articles_commande');
const Produit = require('../models/produit');
const Newsletter = require('../models/newsletter');
const { asyncHandler } = require('../middlewares/errorHandler');
const { 
  sendOrderConfirmedEmail, 
  sendOrderShippedEmail 
} = require('../config/gmail');

/**
 * @route   GET /api/admin/dashboard
 * @desc    Récupérer les statistiques du dashboard admin
 * @access  Private/Admin
 */
const getDashboard = asyncHandler(async (req, res) => {
  // Statistiques globales
  const totalUtilisateurs = await User.count();
  const totalCommandes = await Commande.count();
  const totalProduits = await Produit.count();
  const totalAbonnesNewsletter = await Newsletter.count({ where: { est_actif: true } });

  // Commandes par statut
  const commandesParStatut = await Commande.findAll({
    attributes: [
      'statut',
      [sequelize.fn('COUNT', sequelize.col('id')), 'total']
    ],
    group: ['statut']
  });

  // Revenus du mois en cours
  const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const revenusMois = await Commande.sum('total', {
    where: {
      date_creation: { [Op.gte]: debutMois },
      statut: { [Op.notIn]: ['annulee'] }
    }
  });

  // Top 5 produits les plus vendus
  const topProduits = await Produit.findAll({
    attributes: [
      'id',
      'nom',
      'prix',
      'stock',
      [sequelize.fn('COUNT', sequelize.col('articles_commande.id')), 'ventes']
    ],
    include: [
      {
        model: ArticlesCommande,
        as: 'articles_commande',
        attributes: [],
        required: false
      }
    ],
    group: ['Produit.id'],
    order: [[sequelize.fn('COUNT', sequelize.col('articles_commande.id')), 'DESC']],
    limit: 5,
    subQuery: false
  });

  // Dernières commandes
  const dernieresCommandes = await Commande.findAll({
    limit: 10,
    order: [['date_creation', 'DESC']],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'nom', 'prenom', 'email']
      }
    ]
  });

  // Tous les produits (y compris en rupture) pour gestion admin
  const produits = await Produit.findAll({
    order: [['date_creation', 'DESC']],
    attributes: [
      'id',
      'nom',
      'description',
      'prix',
      'prix_promo',
      'promotion',
      'categorie',
      'stock',
      'en_rupture',
      'est_nouveau',
      'image_avant',
      'image_arriere',
      'images',
      'date_creation'
    ]
  });

  res.json({
    success: true,
    data: {
      statistiques: {
        totalUtilisateurs,
        totalCommandes,
        totalProduits,
        totalAbonnesNewsletter,
        revenusMois: revenusMois || 0
      },
      commandesParStatut,
      topProduits,
      dernieresCommandes,
      produits
    }
  });
});

/**
 * @route   GET /api/admin/users
 * @desc    Récupérer tous les utilisateurs (Admin)
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, est_admin } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  if (search) {
    where[Op.or] = [
      { nom: { [Op.like]: `%${search}%` } },
      { prenom: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
  }

  if (est_admin !== undefined) {
    where.est_admin = est_admin === 'true';
  }

  const { count, rows: users } = await User.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['date_creation', 'DESC']],
    attributes: { exclude: ['mot_de_passe'] }
  });

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    }
  });
});

/**
 * @route   PATCH /api/admin/users/:id/toggle-admin
 * @desc    Promouvoir/rétrograder un utilisateur en admin
 * @access  Private/Admin
 */
const toggleAdmin = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  // Ne pas se désactiver soi-même
  if (user.id === req.user.id && user.est_admin) {
    res.status(400);
    throw new Error('Vous ne pouvez pas retirer vos propres droits d\'administrateur');
  }

  await user.update({
    est_admin: !user.est_admin
  });

  res.json({
    success: true,
    message: `Utilisateur ${user.est_admin ? 'promu' : 'rétrogradé'} avec succès`,
    data: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      est_admin: user.est_admin
    }
  });
});

/**
 * @route   PATCH /api/admin/users/:id/toggle-actif
 * @desc    Activer/désactiver un compte utilisateur
 * @access  Private/Admin
 */
const toggleActif = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  // Ne pas se désactiver soi-même
  if (user.id === req.user.id) {
    res.status(400);
    throw new Error('Vous ne pouvez pas désactiver votre propre compte');
  }

  await user.update({
    est_actif: !user.est_actif
  });

  res.json({
    success: true,
    message: `Compte ${user.est_actif ? 'activé' : 'désactivé'} avec succès`,
    data: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      est_actif: user.est_actif
    }
  });
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Supprimer un utilisateur
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  // Ne pas se supprimer soi-même
  if (user.id === req.user.id) {
    res.status(400);
    throw new Error('Vous ne pouvez pas supprimer votre propre compte');
  }

  await user.destroy();

  res.json({
    success: true,
    message: 'Utilisateur supprimé avec succès'
  });
});

/**
 * @route   POST /api/admin/commandes/:id/confirmer
 * @desc    Mettre à jour le statut d'une commande (Admin). Le corps peut contenir { statut: 'confirmee'|'expediee'|... }.
 *          Par défaut, si aucun statut fourni, le comportement historique est conservé (passe à 'confirmee').
 * @access  Private/Admin
 */
const confirmerCommande = asyncHandler(async (req, res) => {
  const commande = await Commande.findByPk(req.params.id, {
    include: [
      {
        model: ArticlesCommande,
        as: 'articles',
        include: [
          {
            model: Produit,
            as: 'produit',
            attributes: ['id', 'nom', 'image_avant']
          }
        ]
      }
    ]
  });

  if (!commande) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  // Determine desired status (allow admin to choose any valid status)
  const validStatuts = ['en_attente', 'confirmee', 'expediee', 'livree', 'annulee'];
  const souhait = (req.body && req.body.statut) ? String(req.body.statut).trim() : 'confirmee';

  if (!validStatuts.includes(souhait)) {
    res.status(400);
    throw new Error(`Statut invalide: "${souhait}". Statuts valides: ${validStatuts.join(', ')}`);
  }

  // Mettre à jour le statut demandé
  await commande.update({ statut: souhait });

  // Formater les données pour l'email
  const commandeData = {
    ...commande.toJSON(),
    articles: commande.articles.map(a => ({
      nom_produit: a.nom_produit || a.produit?.nom,
      quantite: a.quantite,
      prix_unitaire: a.prix_unitaire,
      prix_total: a.sous_total,
      taille: a.taille,
      couleur: a.couleur
    }))
  };

  // Envoyer l'email approprié au client en fonction du nouveau statut (non bloquant)
  const factureUrl = commande.facture || null;
  try {
    if (souhait === 'confirmee') {
      sendOrderConfirmedEmail(commandeData, factureUrl).catch(err => {
        console.error('⚠️ Erreur envoi email confirmation client:', err.message);
      });
    } else if (souhait === 'expediee') {
      sendOrderShippedEmail(commandeData, factureUrl).catch(err => {
        console.error('⚠️ Erreur envoi email expédition client:', err.message);
      });
    }
  } catch (err) {
    // Défensive: log any unexpected error
    console.error('⚠️ Erreur lors du routage d\'emails selon le statut:', err.message || err);
  }

  res.json({
    success: true,
    message: `Commande mise à jour avec succès. Nouveau statut: ${souhait}`,
    data: commande
  });
});

module.exports = {
  getDashboard,
  getAllUsers,
  toggleAdmin,
  toggleActif,
  deleteUser,
  confirmerCommande
};
