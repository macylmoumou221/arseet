const { Op } = require('sequelize');
const Produit = require('../models/produit');
const CouleursProduits = require('../models/couleurs_produits');
const TaillesProduits = require('../models/tailles_produits');
const { asyncHandler } = require('../middlewares/errorHandler');
const { deleteImage } = require('../config/cloudinary');

/**
 * @route   GET /api/produits
 * @desc    Récupérer tous les produits avec pagination et filtres
 * @access  Public
 */
const getProduits = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 12, 
    categorie, 
    nouveaute, 
    search,
    prix_min,
    prix_max,
    sort = 'date_creation',
    order = 'DESC'
  } = req.query;

  const offset = (page - 1) * limit;
  
  // Construction des filtres
  const where = {};
  
  if (categorie) {
    where.categorie = categorie;
  }
  
  if (nouveaute === 'true') {
    where.est_nouveau = true;
  }
  
  if (search) {
    where[Op.or] = [
      { nom: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }
  
  if (prix_min || prix_max) {
    where.prix = {};
    if (prix_min) where.prix[Op.gte] = prix_min;
    if (prix_max) where.prix[Op.lte] = prix_max;
  }

  // Récupération des produits
  const { count, rows: produits } = await Produit.findAndCountAll({
    where,
    include: [
      {
        model: CouleursProduits,
        as: 'couleurs',
        attributes: ['id', 'couleur', 'code_hexa', 'stock_couleur']
      },
      {
        model: TaillesProduits,
        as: 'tailles',
        attributes: ['id', 'taille', 'stock_taille', 'mesures']
      }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [[sort, order]],
    distinct: true
  });

    // Calculer le prix final avec promotion pour chaque produit
    const produitsAvecPrixFinal = produits.map(p => {
      const prixBase = parseFloat(p.prix);
      const promotion = p.promotion || 0;
      const prixFinal = promotion > 0 ? prixBase * (1 - promotion / 100) : prixBase;
      return {
        ...p.toJSON(),
        prix_final: parseFloat(prixFinal.toFixed(2)),
        promotion: promotion
      };
    });

    res.json({
      success: true,
      data: {
        produits: produitsAvecPrixFinal,
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
 * @route   GET /api/produits/:id
 * @desc    Récupérer un produit par ID
 * @access  Public
 */
const getProduitById = asyncHandler(async (req, res) => {
  const produit = await Produit.findByPk(req.params.id, {
    include: [
      {
        model: CouleursProduits,
        as: 'couleurs',
        attributes: ['id', 'couleur', 'code_hexa', 'stock_couleur']
      },
      {
        model: TaillesProduits,
        as: 'tailles',
        attributes: ['id', 'taille', 'stock_taille', 'mesures']
      }
    ]
  });

  if (!produit) {
    res.status(404);
    throw new Error('Produit non trouvé');
  }

    // Calculer le prix final avec promotion
    const prixBase = parseFloat(produit.prix);
    const promotion = produit.promotion || 0;
    const prixFinal = promotion > 0 ? prixBase * (1 - promotion / 100) : prixBase;
    const produitAvecPrixFinal = {
      ...produit.toJSON(),
      prix_final: parseFloat(prixFinal.toFixed(2)),
      promotion: promotion
    };
    res.json({
      success: true,
      data: produitAvecPrixFinal
    });
});

/**
 * @route   POST /api/produits
 * @desc    Créer un nouveau produit (Admin)
 * @access  Private/Admin
 */
const createProduit = asyncHandler(async (req, res) => {
  const {
    nom,
    description,
    prix,
    prix_promo,
    categorie,
    stock,
    en_rupture,
    est_nouveau,
    promotion = 0,
    couleurs,
    tailles
  } = req.body;

  // Récupérer les URLs des images uploadées via Cloudinary
  const imageAvant = req.files?.image_avant ? req.files.image_avant[0].path : null;
  const imageArriere = req.files?.image_arriere ? req.files.image_arriere[0].path : null;
  const images = req.files?.images ? req.files.images.map(file => file.path) : [];

  // Créer le produit
  const produit = await Produit.create({
    nom,
    description,
    prix,
    prix_promo,
    categorie,
    image_avant: imageAvant,
    image_arriere: imageArriere,
    images,
    stock: stock || 0,
    en_rupture: en_rupture || false,
    est_nouveau: est_nouveau || false,
    promotion
  });

  // Parser et ajouter les couleurs si fournies
  if (couleurs) {
    const couleursArray = typeof couleurs === 'string' ? JSON.parse(couleurs) : couleurs;
    if (Array.isArray(couleursArray) && couleursArray.length > 0) {
      const couleursData = couleursArray.map(c => ({
        produit_id: produit.id,
        couleur: c.couleur,
        code_hexa: c.code_hexa || null,
        stock_couleur: c.stock_couleur || 0
      }));
      await CouleursProduits.bulkCreate(couleursData);
    }
  }

  // Parser et ajouter les tailles si fournies
  if (tailles) {
    const taillesArray = typeof tailles === 'string' ? JSON.parse(tailles) : tailles;
    if (Array.isArray(taillesArray) && taillesArray.length > 0) {
      const taillesData = taillesArray.map(t => ({
        produit_id: produit.id,
        taille: t.taille,
        stock_taille: t.stock_taille || 0,
        mesures: t.mesures || null
      }));
      await TaillesProduits.bulkCreate(taillesData);
    }
  }


  // Récupérer le produit complet avec relations
  const produitComplet = await Produit.findByPk(produit.id, {
    include: [
      { model: CouleursProduits, as: 'couleurs' },
      { model: TaillesProduits, as: 'tailles' }
    ]
  });

  // Envoyer une newsletter de nouveau produit (non-bloquant)
  // L'échec de l'envoi d'emails ne doit pas empêcher la création du produit
  const { sendNewProductEmail } = require('../config/gmail');
  sendNewProductEmail(produitComplet.toJSON())
    .then(result => {
      if (result.sent > 0) {
        console.log(`✅ Newsletter envoyée à ${result.sent} abonné(s) pour le produit #${produit.id}`);
      }
    })
    .catch(error => {
      console.error(`⚠️ Erreur newsletter pour le produit #${produit.id}:`, error.message);
      // L'erreur est loggée mais n'affecte pas la réponse
    });

  res.status(201).json({
    success: true,
    message: 'Produit créé avec succès',
    data: produitComplet
  });
});

/**
 * @route   PUT /api/produits/:id
 * @desc    Mettre à jour un produit (Admin)
 * @access  Private/Admin
 */
const updateProduit = asyncHandler(async (req, res) => {
  const produit = await Produit.findByPk(req.params.id);

  if (!produit) {
    res.status(404);
    throw new Error('Produit non trouvé');
  }

  const {
    nom,
    description,
    prix,
    prix_promo,
    categorie,
    stock,
    en_rupture,
    est_nouveau,
    promotion,
    couleurs,
    tailles
  } = req.body;

  // Gérer les nouvelles images
  let imageAvant = produit.image_avant;
  let imageArriere = produit.image_arriere;
  let images = produit.images || [];

  // Mise à jour de l'image avant
  if (req.files?.image_avant && req.files.image_avant.length > 0) {
    if (produit.image_avant) {
      await deleteImage(produit.image_avant);
    }
    imageAvant = req.files.image_avant[0].path;
  }

  // Mise à jour de l'image arrière
  if (req.files?.image_arriere && req.files.image_arriere.length > 0) {
    if (produit.image_arriere) {
      await deleteImage(produit.image_arriere);
    }
    imageArriere = req.files.image_arriere[0].path;
  }

  // Mise à jour des images supplémentaires
  if (req.files?.images && req.files.images.length > 0) {
    // Supprimer les anciennes images supplémentaires
    if (produit.images && produit.images.length > 0) {
      for (const imageUrl of produit.images) {
        await deleteImage(imageUrl);
      }
    }
    images = req.files.images.map(file => file.path);
  }

  // Mettre à jour le produit
  await produit.update({
    nom: nom || produit.nom,
    description: description !== undefined ? description : produit.description,
    prix: prix || produit.prix,
    prix_promo: prix_promo !== undefined ? prix_promo : produit.prix_promo,
    categorie: categorie || produit.categorie,
    image_avant: imageAvant,
    image_arriere: imageArriere,
    images,
    stock: stock !== undefined ? stock : produit.stock,
    en_rupture: en_rupture !== undefined ? en_rupture : produit.en_rupture,
    est_nouveau: est_nouveau !== undefined ? est_nouveau : produit.est_nouveau,
    promotion: promotion !== undefined ? promotion : produit.promotion
  });

  // Gérer les couleurs (remplacement complet)
  if (couleurs) {
    // Supprimer toutes les anciennes couleurs
    await CouleursProduits.destroy({ where: { produit_id: produit.id } });

    // Ajouter les nouvelles couleurs
    let couleursArray;
    try {
      couleursArray = typeof couleurs === 'string' ? JSON.parse(couleurs) : couleurs;
    } catch (error) {
      res.status(400);
      throw new Error('Format JSON invalide pour les couleurs');
    }

    if (Array.isArray(couleursArray) && couleursArray.length > 0) {
      const couleursData = couleursArray.map(c => ({
        produit_id: produit.id,
        couleur: c.couleur,
        code_hexa: c.code_hexa,
        stock_couleur: c.stock_couleur || 0
      }));
      await CouleursProduits.bulkCreate(couleursData);
    }
  }

  // Gérer les tailles (remplacement complet)
  if (tailles) {
    // Supprimer toutes les anciennes tailles
    await TaillesProduits.destroy({ where: { produit_id: produit.id } });

    // Ajouter les nouvelles tailles
    let taillesArray;
    try {
      taillesArray = typeof tailles === 'string' ? JSON.parse(tailles) : tailles;
    } catch (error) {
      res.status(400);
      throw new Error('Format JSON invalide pour les tailles');
    }

    if (Array.isArray(taillesArray) && taillesArray.length > 0) {
      const taillesData = taillesArray.map(t => ({
        produit_id: produit.id,
        taille: t.taille,
        stock_taille: t.stock_taille || 0,
        mesures: t.mesures || null
      }));
      await TaillesProduits.bulkCreate(taillesData);
    }
  }

  // Récupérer le produit mis à jour avec couleurs et tailles
  const produitMisAJour = await Produit.findByPk(produit.id, {
    include: [
      { model: CouleursProduits, as: 'couleurs' },
      { model: TaillesProduits, as: 'tailles' }
    ]
  });

  res.json({
    success: true,
    message: 'Produit mis à jour avec succès',
    data: produitMisAJour
  });
});

/**
 * @route   DELETE /api/produits/:id
 * @desc    Supprimer un produit (Admin)
 * @access  Private/Admin
 */
const deleteProduit = asyncHandler(async (req, res) => {
  const produit = await Produit.findByPk(req.params.id);

  if (!produit) {
    res.status(404);
    throw new Error('Produit non trouvé');
  }

  // Supprimer les images de Cloudinary
  if (produit.image_avant) {
    await deleteImage(produit.image_avant);
  }
  
  if (produit.image_arriere) {
    await deleteImage(produit.image_arriere);
  }
  
  if (produit.images && produit.images.length > 0) {
    for (const imageUrl of produit.images) {
      await deleteImage(imageUrl);
    }
  }

  // Supprimer le produit (cascade supprimera couleurs et tailles)
  await produit.destroy();

  res.json({
    success: true,
    message: 'Produit supprimé avec succès'
  });
});

/**
 * @route   PATCH /api/produits/:id/rupture
 * @desc    Marquer un produit en rupture ou disponible (Admin)
 * @access  Private/Admin
 */
const toggleRupture = asyncHandler(async (req, res) => {
  const produit = await Produit.findByPk(req.params.id);

  if (!produit) {
    res.status(404);
    throw new Error('Produit non trouvé');
  }

  const { en_rupture } = req.body;

  await produit.update({
    en_rupture: en_rupture !== undefined ? en_rupture : !produit.en_rupture
  });

  res.json({
    success: true,
    message: `Produit marqué comme ${produit.en_rupture ? 'en rupture' : 'disponible'}`,
    data: {
      id: produit.id,
      nom: produit.nom,
      en_rupture: produit.en_rupture
    }
  });
});

/**
 * @route   POST /api/produits/:id/couleurs
 * @desc    Ajouter une couleur à un produit (Admin)
 * @access  Private/Admin
 */
const addCouleur = asyncHandler(async (req, res) => {
  const produit = await Produit.findByPk(req.params.id);

  if (!produit) {
    res.status(404);
    throw new Error('Produit non trouvé');
  }

  const { couleur, code_hexa, stock_couleur } = req.body;

  const nouvelleCouleur = await CouleursProduits.create({
    produit_id: produit.id,
    couleur,
    code_hexa,
    stock_couleur: stock_couleur || 0
  });

  res.status(201).json({
    success: true,
    message: 'Couleur ajoutée avec succès',
    data: nouvelleCouleur
  });
});

/**
 * @route   POST /api/produits/:id/tailles
 * @desc    Ajouter une taille à un produit (Admin)
 * @access  Private/Admin
 */
const addTaille = asyncHandler(async (req, res) => {
  const produit = await Produit.findByPk(req.params.id);

  if (!produit) {
    res.status(404);
    throw new Error('Produit non trouvé');
  }

  const { taille, stock_taille, mesures } = req.body;

  const nouvelleTaille = await TaillesProduits.create({
    produit_id: produit.id,
    taille,
    stock_taille: stock_taille || 0,
    mesures
  });

  res.status(201).json({
    success: true,
    message: 'Taille ajoutée avec succès',
    data: nouvelleTaille
  });
});

/**
 * @route   PATCH /api/produits/:id/promotion
 * @desc    Définir la promotion d'un produit (Admin)
 * @access  Private/Admin
 */
const setPromotion = asyncHandler(async (req, res) => {
  const produit = await Produit.findByPk(req.params.id);
  
  if (!produit) {
    res.status(404);
    throw new Error('Produit non trouvé');
  }

  const { promotion } = req.body;
  
  if (typeof promotion !== 'number' || promotion < 0 || promotion > 100) {
    res.status(400);
    throw new Error('La promotion doit être un nombre entre 0 et 100');
  }

  await produit.update({ promotion });

  res.json({
    success: true,
    message: 'Promotion mise à jour avec succès',
    data: {
      id: produit.id,
      nom: produit.nom,
      promotion: produit.promotion
    }
  });
});

module.exports = {
  getProduits,
  getProduitById,
  createProduit,
  updateProduit,
  deleteProduit,
  toggleRupture,
  addCouleur,
  addTaille,
  setPromotion
};
