/**
 * Templates d'emails pour l'application
 */

const APP_NAME = process.env.APP_NAME || 'Arseet';
const CONTACT_EMAIL = process.env.GMAIL_USER || 'arseetwear@gmail.com';
const LOGO_URL = process.env.LOGO_URL || 'https://res.cloudinary.com/dtbfppoys/image/upload/v1762694418/arseet_branding/logo_email_white.png';

const buildEmailLayout = (contentHtml, { footerLines } = {}) => {
  const year = new Date().getFullYear();
  const footerHtml = Array.isArray(footerLines) && footerLines.length
    ? footerLines.map((line) => `<p>${line}</p>`).join('\n')
    : `<p>© ${year} ${APP_NAME}. Tous droits réservés.</p>\n<p>${CONTACT_EMAIL}</p>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
      line-height: 1.6;
      color: #333333;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    }
    .header {
      background-color: #000000;
      color: #ffffff;
      text-align: center;
      padding: 32px 40px;
    }
    .header img {
      max-width: 180px;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    .header h1 {
      font-size: 26px;
      font-weight: 700;
      text-transform: lowercase;
      letter-spacing: 4px;
    }
    .content {
      padding: 40px;
      background-color: #ffffff;
    }
    .content p {
      font-size: 15px;
      margin-bottom: 18px;
      color: #444444;
    }
    .code-box {
      background-color: #000000;
      color: #ffffff;
      padding: 28px;
      text-align: center;
      border-radius: 10px;
      margin: 36px 0;
    }
    .code-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      opacity: 0.75;
    }
    .code {
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 10px;
      font-family: 'Courier New', monospace;
    }
    .card {
      border: 1px solid #e6e6e6;
      border-radius: 10px;
      padding: 24px;
      margin: 28px 0;
      background-color: #ffffff;
    }
    .card-title {
      font-size: 15px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
      color: #111111;
    }
    .key-value {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      margin-bottom: 10px;
      color: #333333;
    }
    .list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .list li {
      position: relative;
      padding-left: 18px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #3a3a3a;
    }
    .list li::before {
      content: '•';
      position: absolute;
      left: 0;
      top: 0;
      color: #000000;
      font-size: 18px;
    }
    .button {
      display: inline-block;
      background-color: #000000;
      color: #ffffff !important;
      padding: 14px 40px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 15px;
      margin: 26px 0 10px;
    }
    .muted {
      color: #777777;
      font-size: 13px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .table th,
    .table td {
      text-align: left;
      padding: 10px 0;
      font-size: 14px;
      color: #333333;
      border-bottom: 1px solid #e5e5e5;
    }
    .table th {
      font-weight: 600;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #ededed;
    }
    .footer p {
      font-size: 13px;
      color: #888888;
      margin-bottom: 6px;
    }
    @media only screen and (max-width: 600px) {
      .content,
      .header,
      .footer {
        padding: 28px 22px;
      }
      .code {
        font-size: 28px;
        letter-spacing: 8px;
      }
      .card {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="${LOGO_URL}" alt="${APP_NAME}" />
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      ${footerHtml}
    </div>
  </div>
</body>
</html>`;
};

const emailConfirmation = (nom, prenom, codeVerification) => {
  const contentHtml = `
    <p>Bonjour ${prenom} ${nom},</p>
    <p>Voici votre code de vérification pour sécuriser l'accès à votre compte :</p>
    <div class="code-box">
      <div class="code-label">Code de vérification</div>
      <div class="code">${codeVerification}</div>
    </div>
    <p class="muted">Ce code expirera dans <strong>15 minutes</strong>.</p>
    <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
    <p style="margin-top: 32px;">
      Merci,<br>
      <strong>Arseet</strong>
    </p>
  `;

  const year = new Date().getFullYear();
  const text = [
    `Bonjour ${prenom} ${nom},`,
    '',
    'Voici votre code de vérification :',
    `${codeVerification}`,
    '',
    'Ce code expirera dans 15 minutes.',
    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
    '',
    'Merci,',
    'Arseet',
    '',
    `© ${year} ${APP_NAME}`
  ].join('\n');

  return {
    subject: 'Votre code de vérification - Arseet',
    html: buildEmailLayout(contentHtml),
    text
  };
};

const emailBienvenue = (nom, prenom) => {
  const contentHtml = `
    <p>Bonjour ${prenom} ${nom},</p>
    <p>Votre adresse email est confirmée. Vous pouvez dès maintenant profiter pleinement de votre espace Arseet :</p>
    <div class="card">
      <p class="card-title">Vos avantages</p>
      <ul class="list">
        <li>Suivre vos commandes en temps réel</li>
        <li>Enregistrer vos adresses et préférences</li>
        <li>Recevoir des offres et lancements exclusifs</li>
        <li>Gérer facilement vos informations personnelles</li>
      </ul>
    </div>
    <p>Besoin d'aide ? Écrivez-nous à ${CONTACT_EMAIL} et nous vous répondrons rapidement.</p>
    <p style="margin-top: 32px;">
      À très vite,<br>
      <strong>Arseet</strong>
    </p>
  `;

  const year = new Date().getFullYear();
  const text = [
    `Bonjour ${prenom} ${nom},`,
    '',
    'Votre adresse email est confirmée. Voici ce que vous pouvez faire :',
    '- Suivre vos commandes',
    '- Enregistrer vos adresses',
    '- Recevoir des offres exclusives',
    '- Mettre à jour vos informations',
    '',
    `Besoin d'aide ? Contactez-nous : ${CONTACT_EMAIL}`,
    '',
    'À très vite,',
    'Arseet',
    '',
    `© ${year} ${APP_NAME}`
  ].join('\n');

  return {
    subject: 'Bienvenue sur Arseet !',
    html: buildEmailLayout(contentHtml),
    text
  };
};

const emailResetPassword = (nom, prenom, code, { expirationMinutes = 60 } = {}) => {
  const safeExpiration = Number.isFinite(Number(expirationMinutes)) ? Number(expirationMinutes) : 60;

  const contentHtml = `
    <p>Bonjour ${prenom} ${nom},</p>
    <p>Vous avez demandé à réinitialiser votre mot de passe. Utilisez le code ci-dessous pour créer un nouveau mot de passe :</p>
    <div class="code-box">
      <div class="code-label">Code de réinitialisation</div>
      <div class="code">${code}</div>
    </div>
    <p class="muted">Ce code expirera dans ${safeExpiration} minutes.</p>
    <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email. Votre mot de passe restera inchangé.</p>
    <p style="margin-top: 32px;">À bientôt,<br><strong>arseet</strong></p>
  `;

  const year = new Date().getFullYear();
  const textLines = [
    `Bonjour ${prenom} ${nom},`,
    '',
    'Vous avez demandé à réinitialiser votre mot de passe.',
    `Code de réinitialisation : ${code}`,
    `Ce code expirera dans ${safeExpiration} minutes.`,
    '',
    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
    '',
    'À bientôt,',
    'arseet',
    '',
    `© ${year} ${APP_NAME}`
  ];

  return {
    subject: 'Réinitialisation de votre mot de passe',
    html: buildEmailLayout(contentHtml),
    text: textLines.join('\n')
  };
};

const emailNewProduct = (nom, prenom, product, email = '') => {
  const { id, nom: productName, description, prix, promotion = 0, image_avant, categorie } = product;
  
  // Convert prix to number and calculate final price in the template
  const prixNum = parseFloat(prix) || 0;
  const promotionNum = parseFloat(promotion) || 0;
  const finalPrice = promotionNum > 0 ? prixNum - (prixNum * promotionNum / 100) : prixNum;
  
  const priceDisplay = promotionNum > 0
    ? `<span style="text-decoration: line-through; color: #999;">${prixNum.toFixed(2)} DZD</span> <strong style="color: #e74c3c;">${finalPrice.toFixed(2)} DZD</strong> <span style="background-color: #e74c3c; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">-${promotionNum}%</span>`
    : `<strong>${prixNum.toFixed(2)} DZD</strong>`;

  // Greeting based on whether we have a name
  const greeting = (prenom && nom) ? `Bonjour ${prenom} ${nom}` : 'Bonjour';

  const contentHtml = `
    <p>${greeting},</p>
    <p>Découvrez notre <strong>nouveau produit</strong> qui vient d'arriver en boutique :</p>
    
    <div class="card" style="text-align: center;">
      ${image_avant ? `<img src="${image_avant}" alt="${productName}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;" />` : ''}
      <h2 style="font-size: 22px; margin: 16px 0; color: #111;">${productName}</h2>
      ${description ? `<p style="color: #555; font-size: 14px; margin: 12px 0;">${description}</p>` : ''}
      <div style="margin: 24px 0;">
        <div style="font-size: 24px; font-weight: 700; color: #000;">${priceDisplay}</div>
      </div>
      <p class="muted" style="text-transform: uppercase; font-size: 12px; letter-spacing: 1px; margin-top: 12px;">Catégorie: ${categorie}</p>
    </div>
    
    <p style="text-align: center; margin-top: 32px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/produit/${id}" class="button">Voir le produit</a>
    </p>
    
    <p class="muted" style="margin-top: 24px;">Vous recevez cet email car vous êtes abonné à notre newsletter. Pour vous désabonner, <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/newsletter/unsubscribe?email=${encodeURIComponent(email)}" style="color: #000;">cliquez ici</a>.</p>
    
    <p style="margin-top: 32px;">
      À bientôt,<br>
      <strong>Arseet</strong>
    </p>
  `;

  const year = new Date().getFullYear();
  const textLines = [
    `${greeting},`,
    '',
    `Nouveau produit : ${productName}`,
    description ? `${description}` : '',
    '',
    promotionNum > 0 ? `Prix: ${prixNum.toFixed(2)} DZD → ${finalPrice.toFixed(2)} DZD (-${promotionNum}%)` : `Prix: ${prixNum.toFixed(2)} DZD`,
    `Catégorie: ${categorie}`,
    '',
    `Voir le produit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/produit/${id}`,
    '',
    'À bientôt,',
    'Arseet',
    '',
    `© ${year} ${APP_NAME}`
  ];

  return {
    subject: `Nouveau produit : ${productName} - Arseet`,
    html: buildEmailLayout(contentHtml),
    text: textLines.join('\n')
  };
};

const emailNewPromotion = (nom, prenom, product, email = '') => {
  const { id, nom: productName, description, prix, promotion = 0, image_avant, categorie } = product;
  
  // Convert prix to number and calculate final price in the template
  const prixNum = parseFloat(prix) || 0;
  const promotionNum = parseFloat(promotion) || 0;
  const finalPrice = promotionNum > 0 ? prixNum - (prixNum * promotionNum / 100) : prixNum;
  const savings = prixNum - finalPrice;

  // Greeting based on whether we have a name
  const greeting = (prenom && nom) ? `Bonjour ${prenom} ${nom}` : 'Bonjour';

  const contentHtml = `
    <p>${greeting},</p>
    <div style="text-align: center; margin: 24px 0;">
      <h1 style="font-size: 32px; color: #e74c3c; margin: 0;">🔥 PROMOTION EXCEPTIONNELLE 🔥</h1>
      <p style="font-size: 18px; color: #555; margin-top: 8px;">Ne manquez pas cette offre limitée !</p>
    </div>
    
    <div class="card" style="text-align: center; border: 2px solid #e74c3c;">
      ${image_avant ? `<img src="${image_avant}" alt="${productName}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;" />` : ''}
      <h2 style="font-size: 24px; margin: 16px 0; color: #111;">${productName}</h2>
      ${description ? `<p style="color: #555; font-size: 14px; margin: 12px 0;">${description}</p>` : ''}
      
      <div style="margin: 24px 0; padding: 20px; background-color: #fff5f5; border-radius: 8px;">
        <div style="font-size: 16px; color: #999; text-decoration: line-through; margin-bottom: 8px;">${prixNum.toFixed(2)} DZD</div>
        <div style="font-size: 36px; font-weight: 700; color: #e74c3c; margin-bottom: 8px;">${finalPrice.toFixed(2)} DZD</div>
        <div style="background-color: #e74c3c; color: white; padding: 8px 16px; border-radius: 20px; font-size: 18px; font-weight: 700; display: inline-block;">-${promotionNum}%</div>
        <p style="color: #666; font-size: 14px; margin-top: 12px;">Économisez ${savings.toFixed(2)} DZD !</p>
      </div>
      
      <p class="muted" style="text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Catégorie: ${categorie}</p>
    </div>
    
    <p style="text-align: center; margin-top: 32px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/produit/${id}" class="button" style="background-color: #e74c3c; font-size: 18px; padding: 14px 32px;">Profiter de l'offre</a>
    </p>
    
    <p class="muted" style="margin-top: 24px;">Vous recevez cet email car vous êtes abonné à notre newsletter. Pour vous désabonner, <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/newsletter/unsubscribe?email=${encodeURIComponent(email)}" style="color: #000;">cliquez ici</a>.</p>
    
    <p style="margin-top: 32px;">
      À bientôt,<br>
      <strong>Arseet</strong>
    </p>
  `;

  const year = new Date().getFullYear();
  const textLines = [
    `${greeting},`,
    '',
    '🔥 PROMOTION EXCEPTIONNELLE 🔥',
    '',
    `${productName}`,
    description ? `${description}` : '',
    '',
    `Prix initial: ${prixNum.toFixed(2)} DZD`,
    `Prix promotionnel: ${finalPrice.toFixed(2)} DZD`,
    `Réduction: -${promotionNum}%`,
    `Économisez: ${savings.toFixed(2)} DZD`,
    '',
    `Catégorie: ${categorie}`,
    '',
    `Profiter de l'offre: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/produit/${id}`,
    '',
    'À bientôt,',
    'Arseet',
    '',
    `© ${year} ${APP_NAME}`
  ];

  return {
    subject: `🔥 Promotion ${promotion}% sur ${productName} - Arseet`,
    html: buildEmailLayout(contentHtml),
    text: textLines.join('\n')
  };
};

const emailLowStock = (nom, prenom, product, email = '') => {
  const { id, nom: productName, description, prix, promotion = 0, stock, image_avant, categorie } = product;
  
  // Convert prix to number and calculate final price in the template
  const prixNum = parseFloat(prix) || 0;
  const promotionNum = parseFloat(promotion) || 0;
  const finalPrice = promotionNum > 0 ? prixNum - (prixNum * promotionNum / 100) : prixNum;
  
  const priceDisplay = promotionNum > 0
    ? `<span style="text-decoration: line-through; color: #999;">${prixNum.toFixed(2)} DZD</span> <strong style="color: #e74c3c;">${finalPrice.toFixed(2)} DZD</strong> <span style="background-color: #e74c3c; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">-${promotionNum}%</span>`
    : `<strong>${prixNum.toFixed(2)} DZD</strong>`;

  // Greeting based on whether we have a name
  const greeting = (prenom && nom) ? `Bonjour ${prenom} ${nom}` : 'Bonjour';

  const contentHtml = `
    <p>${greeting},</p>
    <div style="text-align: center; margin: 24px 0;">
      <h1 style="font-size: 28px; color: #f39c12; margin: 0;">⚠️ STOCK LIMITÉ</h1>
      <p style="font-size: 16px; color: #555; margin-top: 8px;">Dépêchez-vous avant qu'il ne soit trop tard !</p>
    </div>
    
    <div class="card" style="text-align: center; border: 2px solid #f39c12;">
      ${image_avant ? `<img src="${image_avant}" alt="${productName}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;" />` : ''}
      <h2 style="font-size: 22px; margin: 16px 0; color: #111;">${productName}</h2>
      ${description ? `<p style="color: #555; font-size: 14px; margin: 12px 0;">${description}</p>` : ''}
      
      <div style="margin: 24px 0; padding: 16px; background-color: #fff9e6; border-radius: 8px;">
        <div style="font-size: 24px; font-weight: 700; color: #000; margin-bottom: 12px;">${priceDisplay}</div>
        <div style="background-color: #f39c12; color: white; padding: 8px 16px; border-radius: 20px; font-size: 16px; font-weight: 700; display: inline-block;">
          Plus que ${stock} en stock !
        </div>
      </div>
      
      <p class="muted" style="text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Catégorie: ${categorie}</p>
    </div>
    
    <p style="text-align: center; margin-top: 32px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/produit/${id}" class="button" style="background-color: #f39c12;">Commander maintenant</a>
    </p>
    
    <p class="muted" style="margin-top: 24px;">Vous recevez cet email car vous êtes abonné à notre newsletter. Pour vous désabonner, <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/newsletter/unsubscribe?email=${encodeURIComponent(email)}" style="color: #000;">cliquez ici</a>.</p>
    
    <p style="margin-top: 32px;">
      À bientôt,<br>
      <strong>Arseet</strong>
    </p>
  `;

  const year = new Date().getFullYear();
  const textLines = [
    `${greeting},`,
    '',
    '⚠️ STOCK LIMITÉ - Dépêchez-vous !',
    '',
    `${productName}`,
    description ? `${description}` : '',
    '',
    `Plus que ${stock} articles en stock !`,
    '',
    promotionNum > 0 ? `Prix: ${prixNum.toFixed(2)} DZD → ${finalPrice.toFixed(2)} DZD (-${promotionNum}%)` : `Prix: ${prixNum.toFixed(2)} DZD`,
    `Catégorie: ${categorie}`,
    '',
    `Commander maintenant: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/produit/${id}`,
    '',
    'À bientôt,',
    'Arseet',
    '',
    `© ${year} ${APP_NAME}`
  ];

  return {
    subject: `⚠️ Stock limité pour ${productName} - Arseet`,
    html: buildEmailLayout(contentHtml),
    text: textLines.join('\n')
  };
};

// ============================================
// EMAILS POUR LES COMMANDES
// ============================================

/**
 * Email envoyé à l'admin quand une nouvelle commande est créée
 */
const emailNewOrderAdmin = (commande) => {
  const {
    id,
    nom_complet,
    email,
    telephone,
    adresse_livraison,
    ville,
    wilaya,
    methode_livraison,
    sous_total,
    frais_livraison,
    total,
    notes,
    articles,
    date_creation
  } = commande;

  const dateCommande = new Date(date_creation).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const articlesHtml = articles.map(article => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <strong>${article.nom_produit || 'Produit'}</strong>
        ${article.taille ? `<br><span style="color: #666; font-size: 13px;">Taille: ${article.taille}</span>` : ''}
        ${article.couleur ? `<br><span style="color: #666; font-size: 13px;">Couleur: ${article.couleur}</span>` : ''}
      </td>
      <td style="padding: 12px 0; text-align: center; border-bottom: 1px solid #f0f0f0;">x${article.quantite}</td>
      <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">${parseFloat(article.prix_unitaire).toFixed(2)} DZD</td>
      <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;"><strong>${parseFloat(article.prix_total).toFixed(2)} DZD</strong></td>
    </tr>
  `).join('');

  const contentHtml = `
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
      <h2 style="margin: 0 0 8px; color: #856404; font-size: 20px;">🔔 Nouvelle commande reçue</h2>
      <p style="margin: 0; color: #856404;">Une nouvelle commande nécessite votre attention et confirmation.</p>
    </div>

    <div class="card">
      <p class="card-title">📋 Détails de la commande</p>
      <div class="key-value">
        <span>Numéro de commande:</span>
        <strong>#${id}</strong>
      </div>
      <div class="key-value">
        <span>Date:</span>
        <span>${dateCommande}</span>
      </div>
      <div class="key-value">
        <span>Statut:</span>
        <span style="background-color: #ffc107; color: #000; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">EN ATTENTE</span>
      </div>
    </div>

    <div class="card">
      <p class="card-title">👤 Informations client</p>
      <div class="key-value">
        <span>Nom complet:</span>
        <strong>${nom_complet}</strong>
      </div>
      <div class="key-value">
        <span>Email:</span>
        <a href="mailto:${email}" style="color: #000;">${email}</a>
      </div>
      <div class="key-value">
        <span>Téléphone:</span>
        <a href="tel:${telephone}" style="color: #000; font-weight: 600;">${telephone}</a>
      </div>
    </div>

    <div class="card">
      <p class="card-title">📍 Adresse de livraison</p>
      <p style="margin: 0; line-height: 1.6;">
        ${adresse_livraison}<br>
        ${ville}, ${wilaya}
      </p>
      <div class="key-value" style="margin-top: 12px;">
        <span>Méthode de livraison:</span>
        <strong>${
          methode_livraison === 'domicile' ? '🏠 À domicile' :
          methode_livraison === 'yalidine' ? '� Yalidine' :
          methode_livraison === 'guepex' ? '🚚 Guepex' :
          '—'
        }</strong>
      </div>
    </div>

    ${notes ? `
    <div class="card" style="background-color: #f8f9fa;">
      <p class="card-title">💬 Notes du client</p>
      <p style="margin: 0; font-style: italic; color: #555;">"${notes}"</p>
    </div>
    ` : ''}

    <div class="card">
      <p class="card-title">🛒 Articles commandés</p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #000;">
            <th style="padding: 12px 0; text-align: left; font-size: 13px;">Produit</th>
            <th style="padding: 12px 0; text-align: center; font-size: 13px;">Qté</th>
            <th style="padding: 12px 0; text-align: right; font-size: 13px;">Prix unit.</th>
            <th style="padding: 12px 0; text-align: right; font-size: 13px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${articlesHtml}
        </tbody>
      </table>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
        <div class="key-value">
          <span>Sous-total:</span>
          <span>${parseFloat(sous_total).toFixed(2)} DZD</span>
        </div>
        <div class="key-value">
          <span>Frais de livraison:</span>
          <span>${parseFloat(frais_livraison).toFixed(2)} DZD</span>
        </div>
        <div class="key-value" style="font-size: 18px; margin-top: 8px;">
          <span><strong>TOTAL:</strong></span>
          <strong style="color: #000;">${parseFloat(total).toFixed(2)} DZD</strong>
        </div>
      </div>
    </div>

    <div style="background-color: #e7f3ff; border-left: 4px solid #2196f3; padding: 16px; margin-top: 24px; border-radius: 4px;">
      <p style="margin: 0; color: #0d47a1; font-weight: 600;">📞 Action requise:</p>
      <p style="margin: 8px 0 0; color: #0d47a1;">
        1. Appelez le client au <strong>${telephone}</strong> pour confirmer la commande<br>
        2. Vérifiez les détails de livraison et les articles<br>
        3. Une fois confirmé, connectez-vous au dashboard pour valider la commande
      </p>
    </div>

    <p style="text-align: center; margin-top: 32px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" class="button">Voir la commande dans le dashboard</a>
    </p>
  `;

  const year = new Date().getFullYear();
  const articlesText = articles.map(a => 
    `${a.nom_produit} x${a.quantite} - ${parseFloat(a.prix_total).toFixed(2)} DZD`
  ).join('\n');

  const text = [
    '🔔 NOUVELLE COMMANDE REÇUE',
    '',
    `Numéro: #${id}`,
    `Date: ${dateCommande}`,
    `Statut: EN ATTENTE DE CONFIRMATION`,
    '',
    'CLIENT:',
    `${nom_complet}`,
    `Email: ${email}`,
    `Téléphone: ${telephone}`,
    '',
    'LIVRAISON:',
    `${adresse_livraison}`,
    `${ville}, ${wilaya}`,
    `Méthode: ${methode_livraison === 'domicile' ? 'À domicile' : 'ZR Express'}`,
    '',
    'ARTICLES:',
    articlesText,
    '',
    `Sous-total: ${parseFloat(sous_total).toFixed(2)} DZD`,
    `Livraison: ${parseFloat(frais_livraison).toFixed(2)} DZD`,
    `TOTAL: ${parseFloat(total).toFixed(2)} DZD`,
    '',
    'ACTION REQUISE:',
    `Appelez le client au ${telephone} pour confirmer`,
    '',
    `Dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/commandes/${id}`,
    '',
    `© ${year} ${APP_NAME}`
  ].join('\n');

  return {
    subject: `🔔 Nouvelle commande #${id} - ${nom_complet}`,
    html: buildEmailLayout(contentHtml),
    text
  };
};

/**
 * Email envoyé au client quand sa commande est confirmée par l'admin
 */
const emailOrderConfirmed = (commande, factureUrl = null) => {
  const {
    id,
    nom_complet,
    email,
    telephone,
    adresse_livraison,
    ville,
    wilaya,
    methode_livraison,
    sous_total,
    frais_livraison,
    total,
    articles
  } = commande;

  // Extraire prénom et nom si possible
  const nameParts = nom_complet.split(' ');
  const prenom = nameParts[0] || '';
  const nom = nameParts.slice(1).join(' ') || '';

  const articlesHtml = articles.map(article => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <strong>${article.nom_produit || 'Produit'}</strong>
        ${article.taille ? `<br><span style="color: #666; font-size: 13px;">Taille: ${article.taille}</span>` : ''}
        ${article.couleur ? `<br><span style="color: #666; font-size: 13px;">Couleur: ${article.couleur}</span>` : ''}
      </td>
      <td style="padding: 12px 0; text-align: center; border-bottom: 1px solid #f0f0f0;">x${article.quantite}</td>
      <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #f0f0f0;"><strong>${parseFloat(article.prix_total).toFixed(2)} DZD</strong></td>
    </tr>
  `).join('');

  const contentHtml = `
    <p>Bonjour ${prenom},</p>
    
    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <h2 style="margin: 0 0 8px; color: #155724; font-size: 20px;">✅ Votre commande est confirmée !</h2>
      <p style="margin: 0; color: #155724;">Nous avons bien reçu votre commande et elle est en cours de préparation.</p>
    </div>

    <div class="card">
      <p class="card-title">📋 Récapitulatif de votre commande</p>
      <div class="key-value">
        <span>Numéro de commande:</span>
        <strong>#${id}</strong>
      </div>
      <div class="key-value">
        <span>Statut:</span>
        <span style="background-color: #28a745; color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">CONFIRMÉE</span>
      </div>
    </div>

    <div class="card">
      <p class="card-title">📍 Livraison prévue à</p>
      <p style="margin: 0; line-height: 1.6;">
        <strong>${nom_complet}</strong><br>
        ${adresse_livraison}<br>
        ${ville}, ${wilaya}<br>
        ${telephone}
      </p>
      <div class="key-value" style="margin-top: 12px;">
        <span>Méthode:</span>
        <strong>${
          methode_livraison === 'domicile' ? '🏠 Livraison à domicile' :
          methode_livraison === 'yalidine' ? '� Yalidine' :
          methode_livraison === 'guepex' ? '🚚 Guepex' :
          '—'
        }</strong>
      </div>
    </div>

    <div class="card">
      <p class="card-title">🛒 Vos articles</p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #000;">
            <th style="padding: 12px 0; text-align: left; font-size: 13px;">Produit</th>
            <th style="padding: 12px 0; text-align: center; font-size: 13px;">Quantité</th>
            <th style="padding: 12px 0; text-align: right; font-size: 13px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${articlesHtml}
        </tbody>
      </table>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
        <div class="key-value">
          <span>Sous-total:</span>
          <span>${parseFloat(sous_total).toFixed(2)} DZD</span>
        </div>
        <div class="key-value">
          <span>Frais de livraison:</span>
          <span>${parseFloat(frais_livraison).toFixed(2)} DZD</span>
        </div>
        <div class="key-value" style="font-size: 18px; margin-top: 8px;">
          <span><strong>TOTAL:</strong></span>
          <strong style="color: #000;">${parseFloat(total).toFixed(2)} DZD</strong>
        </div>
      </div>
    </div>

    ${factureUrl ? `
    <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 16px; margin: 24px 0; border-radius: 8px; text-align: center;">
      <p style="margin: 0 0 12px; font-weight: 600; color: #333;">📄 Votre facture</p>
      <a href="${factureUrl}" class="button" style="background-color: #6c757d;">Télécharger la facture (PDF)</a>
    </div>
    ` : ''}

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #856404;">
        <strong>📦 Prochaine étape:</strong> Votre commande va être préparée et expédiée. Vous recevrez un email de confirmation d'expédition dès qu'elle sera en route.
      </p>
    </div>

    <p>Pour toute question concernant votre commande, n'hésitez pas à nous contacter à ${CONTACT_EMAIL} ou par téléphone.</p>

    <p style="margin-top: 32px;">
      Merci pour votre confiance,<br>
      <strong>Arseet</strong>
    </p>
  `;

  const year = new Date().getFullYear();
  const articlesText = articles.map(a => 
    `${a.nom_produit} x${a.quantite} - ${parseFloat(a.prix_total).toFixed(2)} DZD`
  ).join('\n');

  const text = [
    `Bonjour ${prenom},`,
    '',
    '✅ COMMANDE CONFIRMÉE',
    '',
    `Numéro: #${id}`,
    'Statut: CONFIRMÉE - En cours de préparation',
    '',
    'LIVRAISON:',
    `${nom_complet}`,
    `${adresse_livraison}`,
    `${ville}, ${wilaya}`,
    `${telephone}`,
    '',
    'ARTICLES:',
    articlesText,
    '',
    `Sous-total: ${parseFloat(sous_total).toFixed(2)} DZD`,
    `Livraison: ${parseFloat(frais_livraison).toFixed(2)} DZD`,
    `TOTAL: ${parseFloat(total).toFixed(2)} DZD`,
    '',
    factureUrl ? `Facture: ${factureUrl}` : '',
    '',
    'Votre commande va être préparée et expédiée sous peu.',
    'Vous recevrez un email dès qu\'elle sera en route.',
    '',
    `Contact: ${CONTACT_EMAIL}`,
    '',
    'Merci pour votre confiance,',
    'Arseet',
    '',
    `© ${year} ${APP_NAME}`
  ].join('\n');

  return {
    subject: `✅ Commande #${id} confirmée - Arseet`,
    html: buildEmailLayout(contentHtml),
    text
  };
};

/**
 * Email envoyé au client quand sa commande est expédiée
 */
const emailOrderShipped = (commande) => {
  const {
    id,
    nom_complet,
    adresse_livraison,
    ville,
    wilaya,
    methode_livraison,
    total
  } = commande;

  // Extraire prénom
  const prenom = nom_complet.split(' ')[0] || '';

  const contentHtml = `
    <p>Bonjour ${prenom},</p>
    
    <div style="background-color: #cfe2ff; border-left: 4px solid #0d6efd; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <h2 style="margin: 0 0 8px; color: #084298; font-size: 20px;">📦 Votre commande est en route !</h2>
      <p style="margin: 0; color: #084298;">Votre colis a été expédié et sera bientôt livré.</p>
    </div>

    <div class="card">
      <p class="card-title">📋 Informations de livraison</p>
      <div class="key-value">
        <span>Numéro de commande:</span>
        <strong>#${id}</strong>
      </div>
      <div class="key-value">
        <span>Statut:</span>
        <span style="background-color: #0d6efd; color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">EXPÉDIÉE</span>
      </div>
      <div class="key-value">
        <span>Montant total:</span>
        <strong>${parseFloat(total).toFixed(2)} DZD</strong>
      </div>
    </div>

    <div class="card">
      <p class="card-title">📍 Adresse de livraison</p>
      <p style="margin: 0; line-height: 1.6;">
        <strong>${nom_complet}</strong><br>
        ${adresse_livraison}<br>
        ${ville}, ${wilaya}
      </p>
      <div class="key-value" style="margin-top: 12px;">
        <span>Méthode:</span>
        <strong>${
          methode_livraison === 'domicile' ? '🏠 Livraison à domicile' :
          methode_livraison === 'yalidine' ? '� Yalidine' :
          methode_livraison === 'guepex' ? '🚚 Guepex' :
          '—'
        }</strong>
      </div>
    </div>

    <div style="background-color: #d1ecf1; border-left: 4px solid #0c5460; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #0c5460;">
        <strong>💡 Astuce:</strong> Assurez-vous d'être disponible pour réceptionner votre colis. Le livreur pourrait vous contacter pour confirmer la livraison.
      </p>
    </div>

    <p>Pour toute question, contactez-nous à ${CONTACT_EMAIL}</p>

    <p style="margin-top: 32px;">
      Merci pour votre commande,<br>
      <strong>Arseet</strong>
    </p>
  `;

  const year = new Date().getFullYear();
  const text = [
    `Bonjour ${prenom},`,
    '',
    '📦 COMMANDE EXPÉDIÉE',
    '',
    `Numéro: #${id}`,
    'Statut: EXPÉDIÉE - En cours de livraison',
    '',
    'LIVRAISON:',
    `${nom_complet}`,
    `${adresse_livraison}`,
    `${ville}, ${wilaya}`,
    `Méthode: ${
      methode_livraison === 'domicile' ? 'À domicile' :
      methode_livraison === 'yalidine' ? 'Yalidine' :
      methode_livraison === 'guepex' ? 'Guepex' :
      '—'
    }`,
    '',
    `Montant: ${parseFloat(total).toFixed(2)} DZD`,
    '',
    'Votre colis est en route et sera livré prochainement.',
    '',
    `Contact: ${CONTACT_EMAIL}`,
    '',
    'Merci,',
    'Arseet',
    '',
    `© ${year} ${APP_NAME}`
  ].join('\n');

  return {
    subject: `📦 Commande #${id} expédiée - Arseet`,
    html: buildEmailLayout(contentHtml),
    text
  };
};

module.exports = {
  buildEmailLayout,
  emailConfirmation,
  emailBienvenue,
  emailResetPassword,
  emailNewProduct,
  emailNewPromotion,
  emailLowStock,
  // Emails commandes
  emailNewOrderAdmin,
  emailOrderConfirmed,
  emailOrderShipped
};
