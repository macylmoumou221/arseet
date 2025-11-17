const { google } = require('googleapis');
const sgMail = require('@sendgrid/mail');
const http = require('http');
const https = require('https');
const pathModule = require('path');
const { 
  buildEmailLayout, 
  emailConfirmation, 
  emailBienvenue, 
  emailResetPassword, 
  emailNewProduct, 
  emailNewPromotion, 
  emailLowStock,
  emailNewOrderAdmin,
  emailOrderShipped
} = require('../utils/emailTemplates');
const Newsletter = require('../models/newsletter');

/**
 * Configuration Gmail API avec OAuth2
 * Utilise les credentials OAuth2 pour envoyer des emails via Gmail
 */

// Configuration OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

const APP_NAME = process.env.APP_NAME || 'Arseet';
const allowUntrustedTLS = process.env.GMAIL_ALLOW_UNTRUSTED_TLS === 'true';

const formatCurrency = (value) => {
  if (value === undefined || value === null || value === '') {
    return '—';
  }

  const number = Number(value);
  if (Number.isFinite(number)) {
    return `${number.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DZD`;
  }

  return `${value} DZD`;
};

const safeText = (value, fallback = '—') => {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return fallback;
  }

  return value;
};

const getAddressLines = (order) => {
  if (!order) {
    return [];
  }

  const lines = [
    safeText(order.adresse_livraison, ''),
    [safeText(order.ville, ''), safeText(order.wilaya, '')].filter(Boolean).join(', '),
    safeText(order.code_postal, '')
  ].filter((line) => line && line.length);

  return lines;
};

const buildArticlesSections = (articles) => {
  if (!Array.isArray(articles) || articles.length === 0) {
    return { html: '', textLines: [] };
  }

  const rows = articles.map((item, index) => {
    const name = safeText(item.nom || item.produit_nom || item.produit || `Article ${index + 1}`, `Article ${index + 1}`);
    const quantity = safeText(item.quantite, '1');
    const options = [
      item.taille ? `Taille ${item.taille}` : null,
      item.couleur ? `Couleur ${item.couleur}` : null
    ].filter(Boolean).join(' · ');
    const priceValue = item.prix_total ?? item.total ?? item.prix ?? item.prix_unitaire;
    const price = priceValue !== undefined ? formatCurrency(priceValue) : '';

    return {
      html: `<tr><td>${name}</td><td>${quantity}</td><td>${options || '—'}</td><td>${price || '—'}</td></tr>`,
      text: `- ${name} x${quantity}${options ? ` (${options})` : ''}${price ? ` - ${price}` : ''}`
    };
  });

  const html = `<div class="card">
      <p class="card-title">Articles</p>
      <table class="table">
        <thead>
          <tr>
            <th>Article</th>
            <th>Qté</th>
            <th>Options</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => row.html).join('')}
        </tbody>
      </table>
    </div>`;

  return {
    html,
    textLines: rows.map((row) => row.text)
  };
};

// If Gmail refresh token exists keep oauth2Client credentials (left for backward compatibility/tools)
if (process.env.GMAIL_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });
}

// Configure SendGrid if API key provided
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || null;
// Admin email (fallback to known admin address)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SENDGRID_FROM = process.env.SENDGRID_FROM || process.env.GMAIL_USER || ADMIN_EMAIL || `no-reply@${process.env.APP_NAME ? process.env.APP_NAME.toLowerCase() : 'arseet'}.com`;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * Envoyer un email via Gmail API
 * @param {Object} options - Options de l'email
 * @param {string} options.to - Destinataire
 * @param {string} options.subject - Sujet
 * @param {string} options.html - Contenu HTML
 * @param {string} options.text - Contenu texte brut
 * @param {Array} options.attachments - Pièces jointes (optionnel)
 */
const sendEmail = async ({ to, subject, html, text, attachments }) => {
  try {
    if (!SENDGRID_API_KEY) {
      console.log('⚠️ SendGrid non configuré - Email non envoyé (simulation)');
      console.log(`📧 Email pour: ${to}`);
      console.log(`📝 Sujet: ${subject}`);
      // Provide a simulated success to avoid breaking calling code in dev
      return { success: false, message: 'SendGrid non configuré' };
    }

    // Build message
    const msg = {
      to,
      from: SENDGRID_FROM,
      subject,
      text: text || '',
      html: html || ''
    };

    // Handle attachments: SendGrid expects base64 content for attachments.
    if (Array.isArray(attachments) && attachments.length) {
      const sgAttachments = [];
      for (const a of attachments) {
        if (a.content) {
          const contentBase64 = Buffer.isBuffer(a.content)
            ? a.content.toString('base64')
            : Buffer.from(String(a.content)).toString('base64');
          sgAttachments.push({ content: contentBase64, filename: a.filename || 'attachment', type: a.contentType || 'application/octet-stream', disposition: 'attachment' });
        } else if (a.path && /^https?:\/\//.test(a.path)) {
              // If it's a URL, try to fetch the file and attach it. If fetch fails, fall back to adding a download link.
              try {
                const fetchUrlAsBuffer = (fileUrl) => new Promise((resolve, reject) => {
                  const lib = fileUrl.startsWith('https') ? https : http;
                  const req = lib.get(fileUrl, (res) => {
                    if (res.statusCode >= 400) return reject(new Error('Failed to fetch file, status ' + res.statusCode));
                    const chunks = [];
                    res.on('data', (chunk) => chunks.push(chunk));
                    res.on('end', () => resolve(Buffer.concat(chunks)));
                  });
                  req.on('error', reject);
                });

                const buffer = await fetchUrlAsBuffer(a.path);
                const contentBase64 = buffer.toString('base64');
                const filename = a.filename || pathModule.basename(a.path.split('?')[0]) || 'attachment';
                const contentType = a.contentType || 'application/octet-stream';
                sgAttachments.push({ content: contentBase64, filename, type: contentType, disposition: 'attachment' });
              } catch (err) {
                // Fallback: include a download link in the email body
                msg.html = `${msg.html}<p><a href="${a.path}">Télécharger: ${a.filename || 'Fichier'}</a></p>`;
                msg.text = `${msg.text || ''}\nTélécharger: ${a.path}`;
                console.warn('⚠️ Could not fetch attachment URL, included link instead:', a.path, err.message || err);
              }
            }
      }
      if (sgAttachments.length) msg.attachments = sgAttachments;
    }

    const result = await sgMail.send(msg);
    console.log('✅ Email envoyé via SendGrid:', result && result[0] && result[0].headers ? result[0].headers['x-message-id'] || 'sent' : 'sent');
    return { success: true };

  } catch (error) {
    console.error('❌ Erreur envoi email SendGrid:', error.message || error);
    throw error;
  }
};

/**
 * Envoyer un email de vérification
 */
const sendVerificationEmail = async (to, nom, prenom, code) => {
  const emailContent = emailConfirmation(nom, prenom, code);
  
  return await sendEmail({
    to,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  });
};

/**
 * Envoyer un email de bienvenue
 */
const sendWelcomeEmail = async (to, nom, prenom) => {
  const emailContent = emailBienvenue(nom, prenom);
  
  return await sendEmail({
    to,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  });
};

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
const sendPasswordResetEmail = async (to, nom, prenom, code, options = {}) => {
  const emailContent = emailResetPassword(nom, prenom, code, options);

  return await sendEmail({
    to,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  });
};

/**
 * Envoyer un email de confirmation de commande
 */
const sendOrderConfirmation = async (to, orderData = {}, factureUrl = null, factureBuffer = null, factureFilename = null) => {
  const subject = `Votre commande #${orderData.id || ''} - ${APP_NAME}`;

  const html = buildEmailLayout(`
    <p>Bonjour ${safeText(orderData.nom_complet, '')},</p>
    <p><strong>Merci pour votre commande !</strong></p>
    
    <div class="card">
      <p class="card-title">📋 Commande #${orderData.id}</p>
      <p>Un de nos conseillers va vous appeler prochainement pour <strong>confirmer votre commande</strong>.</p>
      <p>Votre facture est jointe à cet email.</p>
    </div>

    <!-- Cancellation fee notice removed -->

    <p style="margin-top: 32px;">Cordialement,<br><strong>L'équipe Arseet</strong></p>
  `);

  const year = new Date().getFullYear();
  const text = [
    `Bonjour ${safeText(orderData.nom_complet, '')},`,
    '',
    'Merci pour votre commande !',
    '',
    `Commande #${orderData.id}`,
    '',
    'Un de nos conseillers va vous appeler prochainement pour confirmer votre commande.',
    'Votre facture est jointe à cet email.',
    '',
  // Cancellation fee notice removed from text version
    '',
    'Cordialement,',
    'L\'équipe Arseet',
    '',
    `© ${year} ${APP_NAME}`
  ].join('\n');

  // Préparer la pièce jointe: prefer raw buffer if provided (sent from request body), otherwise attach by URL.
  let attachments = [];
  if (factureBuffer) {
    attachments = [{
      filename: factureFilename || `Facture_Commande_${orderData.id}.pdf`,
      content: factureBuffer,
      contentType: 'application/pdf'
    }];
  } else if (factureUrl) {
    attachments = [{
      filename: `Facture_Commande_${orderData.id}.pdf`,
      path: factureUrl // URL Firebase - sendEmail will try to fetch and attach
    }];
  }

  return await sendEmail({ to, subject, html, text, attachments });
};

/**
 * Envoyer un email de mise à jour de statut de commande
 */
const sendOrderStatusUpdate = async (to, orderData) => {
  const statusMessages = {
    en_cours: 'poursuit son traitement',
    expediee: 'a été expédiée',
    livree: 'a été livrée',
    annulee: 'a été annulée'
  };

  const subject = `Mise à jour de votre commande #${orderData.id}`;
  const statusMessage = statusMessages[orderData.statut] || 'a été mise à jour';
  const articlesSection = buildArticlesSections(orderData.articles);
  const trackingHtml = orderData.numero_suivi
    ? `<p class="muted">Numéro de suivi : <strong>${orderData.numero_suivi}</strong></p>`
    : '';
  const trackingText = orderData.numero_suivi ? `Numéro de suivi : ${orderData.numero_suivi}` : null;

  const html = buildEmailLayout(`
    <p>Bonjour ${safeText(orderData.nom_complet, '')},</p>
    <div class="card">
      <p class="card-title">Commande #${orderData.id}</p>
      <p>Votre commande ${statusMessage}.</p>
      ${trackingHtml}
    </div>
    ${articlesSection.html}
    <p class="muted">Nous vous informerons dès que de nouvelles informations seront disponibles.</p>
    <p style="margin-top: 32px;">À bientôt,<br><strong>arseet</strong></p>
  `);

  const year = new Date().getFullYear();
  const textLines = [
    `Bonjour ${safeText(orderData.nom_complet, '')},`,
    '',
    `Votre commande #${orderData.id} ${statusMessage}.`
  ];

  if (trackingText) {
    textLines.push(trackingText);
  }

  if (articlesSection.textLines.length) {
    textLines.push('', 'Articles :', ...articlesSection.textLines);
  }

  textLines.push(
    '',
    'Nous vous informerons dès que de nouvelles informations seront disponibles.',
    '',
    'À bientôt,',
    'arseet',
    '',
    `© ${year} ${APP_NAME}`
  );

  const text = textLines.join('\n');

  return await sendEmail({ to, subject, html, text });
};

/**
 * Envoyer un email de confirmation d'inscription à la newsletter
 */
const sendNewsletterConfirmation = async (to) => {
  const subject = `Bienvenue dans notre newsletter - ${APP_NAME}`;

  const html = buildEmailLayout(`
    <p>Bonjour,</p>
    <p>Merci de vous être inscrit à notre newsletter. Voici ce qui vous attend :</p>
    <div class="card">
      <p class="card-title">À quoi s'attendre</p>
      <ul class="list">
        <li>Offres exclusives réservées aux abonnés</li>
        <li>Accès prioritaire aux nouveautés arseet</li>
        <li>Conseils et inspirations style</li>
        <li>Alertes sur les réapprovisionnements</li>
      </ul>
    </div>
    <p class="muted">Vous pouvez vous désinscrire à tout moment via le lien présent dans chaque email.</p>
    <p style="margin-top: 32px;">Bienvenue,<br><strong>arseet</strong></p>
  `);

  const year = new Date().getFullYear();
  const text = [
    'Bonjour,',
    '',
    'Merci de vous être inscrit à notre newsletter. Vous recevrez :',
    '- Offres exclusives réservées aux abonnés',
    '- Accès prioritaire aux nouveautés arseet',
    '- Conseils et inspirations style',
    '- Alertes sur les réapprovisionnements',
    '',
    'Vous pouvez vous désinscrire à tout moment depuis nos emails.',
    '',
    'Bienvenue,',
    'arseet',
    '',
    `© ${year} ${APP_NAME}`
  ].join('\n');

  return await sendEmail({ to, subject, html, text });
};

/**
 * Envoyer un email de notification de nouveau produit à tous les abonnés actifs
 */
const sendNewProductEmail = async (product) => {
  try {
    // Récupérer tous les abonnés actifs
    const subscribers = await Newsletter.findAll({
      where: { est_actif: true }
    });

    if (subscribers.length === 0) {
      console.log('ℹ️ Aucun abonné actif pour la newsletter');
      return { success: true, sent: 0 };
    }

    console.log(`📧 Envoi de la newsletter à ${subscribers.length} abonné(s)...`);

    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    // Envoyer l'email à chaque abonné
    for (const subscriber of subscribers) {
      try {
        const emailContent = emailNewProduct(
          '', // nom - newsletter table doesn't have this field
          '', // prenom - newsletter table doesn't have this field
          product,
          subscriber.email // Pass subscriber email for unsubscribe link
        );

        await sendEmail({
          to: subscriber.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });

        results.sent++;
        console.log(`✅ Email envoyé à ${subscriber.email}`);

      } catch (error) {
        results.failed++;
        results.errors.push({
          email: subscriber.email,
          error: error.message
        });
        console.error(`❌ Erreur envoi email à ${subscriber.email}:`, error.message);
      }
    }

    console.log(`✅ Newsletter envoyée: ${results.sent} succès, ${results.failed} échecs`);
    
    return {
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la newsletter:', error.message);
    throw error;
  }
};

/**
 * Envoyer un email de promotion à tous les abonnés actifs
 */
const sendPromotionEmail = async (product) => {
  try {
    // Récupérer tous les abonnés actifs
    const subscribers = await Newsletter.findAll({
      where: { est_actif: true }
    });

    if (subscribers.length === 0) {
      console.log('ℹ️ Aucun abonné actif pour la newsletter promotion');
      return { success: true, sent: 0 };
    }

    console.log(`📧 Envoi de la promotion à ${subscribers.length} abonné(s)...`);

    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    // Envoyer l'email à chaque abonné
    for (const subscriber of subscribers) {
      try {
        const emailContent = emailNewPromotion(
          '', // nom - newsletter table doesn't have this field
          '', // prenom - newsletter table doesn't have this field
          product,
          subscriber.email // Pass subscriber email for unsubscribe link
        );

        await sendEmail({
          to: subscriber.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });

        results.sent++;
        console.log(`✅ Email promotion envoyé à ${subscriber.email}`);

      } catch (error) {
        results.failed++;
        results.errors.push({
          email: subscriber.email,
          error: error.message
        });
        console.error(`❌ Erreur envoi email à ${subscriber.email}:`, error.message);
      }
    }

    console.log(`✅ Newsletter promotion envoyée: ${results.sent} succès, ${results.failed} échecs`);
    
    return {
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la newsletter promotion:', error.message);
    throw error;
  }
};

/**
 * Envoyer un email de stock limité à tous les abonnés actifs
 */
const sendLowStockEmail = async (product) => {
  try {
    // Récupérer tous les abonnés actifs
    const subscribers = await Newsletter.findAll({
      where: { est_actif: true }
    });

    if (subscribers.length === 0) {
      console.log('ℹ️ Aucun abonné actif pour la newsletter stock limité');
      return { success: true, sent: 0 };
    }

    console.log(`📧 Envoi de l'alerte stock limité à ${subscribers.length} abonné(s)...`);

    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    // Envoyer l'email à chaque abonné
    for (const subscriber of subscribers) {
      try {
        const emailContent = emailLowStock(
          '', // nom - newsletter table doesn't have this field
          '', // prenom - newsletter table doesn't have this field
          product,
          subscriber.email // Pass subscriber email for unsubscribe link
        );

        await sendEmail({
          to: subscriber.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });

        results.sent++;
        console.log(`✅ Email stock limité envoyé à ${subscriber.email}`);

      } catch (error) {
        results.failed++;
        results.errors.push({
          email: subscriber.email,
          error: error.message
        });
        console.error(`❌ Erreur envoi email à ${subscriber.email}:`, error.message);
      }
    }

    console.log(`✅ Newsletter stock limité envoyée: ${results.sent} succès, ${results.failed} échecs`);
    
    return {
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la newsletter stock limité:', error.message);
    throw error;
  }
};

/**
 * Envoyer un email à l'admin pour une nouvelle commande
 */
const sendNewOrderAdminEmail = async (commande) => {
  try {
    const adminEmail = ADMIN_EMAIL;

    const emailContent = emailNewOrderAdmin(commande);

    await sendEmail({
      to: adminEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });

    console.log(`✅ Email de nouvelle commande envoyé à l'admin (${adminEmail})`);
    return { success: true };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email admin:', error.message);
    throw error;
  }
};

/**
 * Envoyer un email de confirmation de commande au client
 */
/**
 * Envoyer un email de confirmation de commande au client
 */
const sendOrderConfirmedEmail = async (commande, factureUrl = null, factureBuffer = null, factureFilename = null) => {
  try {
    const subject = `Commande #${commande.id} confirmée - ${APP_NAME}`;

    const html = buildEmailLayout(`
      <p>Bonjour ${commande.nom_complet || ''},</p>
      
      <div class="card">
        <p class="card-title">✅ Votre commande a été confirmée !</p>
        <p>Commande #${commande.id}</p>
        <p>Merci pour votre fidélité.</p>
      </div>

      <!-- Cancellation fee notice removed -->

      <p class="muted">📎 Votre facture est jointe à cet email.</p>

      <p style="margin-top: 32px;">Cordialement,<br><strong>L'équipe Arseet</strong></p>
    `);

    const year = new Date().getFullYear();
    const text = [
      `Bonjour ${commande.nom_complet || ''},`,
      '',
      '✅ Votre commande a été confirmée !',
      `Commande #${commande.id}`,
      '',
      'Merci pour votre fidélité.',
      '',
    // Cancellation fee notice removed from text version
      '',
      'Votre facture est jointe à cet email.',
      '',
      'Cordialement,',
      'L\'équipe Arseet',
      '',
      `© ${year} ${APP_NAME}`
    ].join('\n');

    // Préparer la pièce jointe: prefer raw buffer if provided via optional params, otherwise attach by URL
    let attachments = [];
    if (factureBuffer) {
      attachments = [{ filename: factureFilename || `Facture_Commande_${commande.id}.pdf`, content: factureBuffer, contentType: 'application/pdf' }];
    } else if (factureUrl) {
      attachments = [{ filename: `Facture_Commande_${commande.id}.pdf`, path: factureUrl }];
    }

    await sendEmail({
      to: commande.email,
      subject,
      html,
      text,
      attachments
    });

    console.log(`✅ Email de confirmation envoyé au client (${commande.email})`);
    return { success: true };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error.message);
    throw error;
  }
};

/**
 * Envoyer un email d'expédition au client
 */
const sendOrderShippedEmail = async (commande) => {
  try {
    const emailContent = emailOrderShipped(commande);

    await sendEmail({
      to: commande.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });

    console.log(`✅ Email d'expédition envoyé au client (${commande.email})`);
    return { success: true };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email d\'expédition:', error.message);
    throw error;
  }
};

/**
 * Envoyer un email personnalisé à tous les abonnés de la newsletter
 */
const sendCustomNewsletterEmail = async (subject, message, imageUrl = null) => {
  try {
    // Récupérer tous les abonnés actifs
    const subscribers = await Newsletter.findAll({
      where: { est_actif: true }
    });

    if (subscribers.length === 0) {
      console.log('ℹ️ Aucun abonné actif pour la newsletter');
      return { success: true, sent: 0 };
    }

    console.log(`📧 Envoi de l'email personnalisé à ${subscribers.length} abonné(s)...`);

    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    // Envoyer l'email à chaque abonné
    for (const subscriber of subscribers) {
      try {
        // Construire le HTML avec image optionnelle
        const imageSection = imageUrl 
          ? `<img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;" />`
          : '';

        const html = buildEmailLayout(`
          ${imageSection}
          <div style="white-space: pre-wrap;">${message}</div>
          <p class="muted" style="margin-top: 32px; font-size: 12px;">
            Vous recevez cet email car vous êtes abonné à la newsletter ${APP_NAME}.<br>
            <a href="${process.env.FRONTEND_URL || 'https://arseet.com'}/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}" style="color: #666;">Se désinscrire</a>
          </p>
        `);

        const year = new Date().getFullYear();
        const text = [
          message,
          '',
          '',
          `Vous recevez cet email car vous êtes abonné à la newsletter ${APP_NAME}.`,
          `Pour vous désinscrire: ${process.env.FRONTEND_URL || 'https://arseet.com'}/newsletter/unsubscribe?email=${subscriber.email}`,
          '',
          `© ${year} ${APP_NAME}`
        ].join('\n');

        await sendEmail({
          to: subscriber.email,
          subject,
          html,
          text
        });

        results.sent++;
        console.log(`✅ Email personnalisé envoyé à ${subscriber.email}`);

      } catch (error) {
        results.failed++;
        results.errors.push({
          email: subscriber.email,
          error: error.message
        });
        console.error(`❌ Erreur envoi email à ${subscriber.email}:`, error.message);
      }
    }

    console.log(`✅ Email personnalisé envoyé: ${results.sent} succès, ${results.failed} échecs`);
    
    return {
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email personnalisé:', error.message);
    throw error;
  }
};


/**
 * Envoyer un message personnalisé à l'admin depuis le formulaire de contact public
 */
const sendContactEmail = async ({ nom, email, sujet, message }) => {
  const adminEmail = ADMIN_EMAIL;

  // Email template
  const contentHtml = `
    <div style="background-color: #e7f3ff; border-left: 4px solid #2196f3; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
      <h2 style="margin: 0 0 8px; color: #0d47a1; font-size: 20px;">📩 Nouveau message de contact</h2>
      <p style="margin: 0; color: #0d47a1;">Un utilisateur a envoyé un message via le formulaire public.</p>
    </div>
    <div class="card">
      <p class="card-title">👤 Informations de l'expéditeur</p>
      <div class="key-value"><span>Nom:</span> <strong>${nom}</strong></div>
      <div class="key-value"><span>Email:</span> <a href="mailto:${email}" style="color: #000;">${email}</a></div>
    </div>
    <div class="card">
      <p class="card-title">📌 Sujet</p>
      <p style="margin: 0; font-weight: 600;">${sujet}</p>
    </div>
    <div class="card">
      <p class="card-title">💬 Message</p>
      <p style="margin: 0; white-space: pre-line;">${message}</p>
    </div>
    <p style="margin-top: 32px;">Répondez directement à <a href="mailto:${email}" style="color: #000;">${email}</a> pour contacter l'utilisateur.</p>
  `;

  const year = new Date().getFullYear();
  const text = [
    'NOUVEAU MESSAGE DE CONTACT',
    '',
    `Nom: ${nom}`,
    `Email: ${email}`,
    `Sujet: ${sujet}`,
    '',
    'Message:',
    message,
    '',
    `Répondez à: ${email}`,
    '',
    `© ${year} ${APP_NAME}`
  ].join('\n');

  return await sendEmail({
    to: adminEmail,
    subject: `📩 Nouveau message de contact - ${APP_NAME}`,
    html: buildEmailLayout(contentHtml),
    text
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendNewsletterConfirmation,
  sendNewProductEmail,
  sendPromotionEmail,
  sendLowStockEmail,
  sendCustomNewsletterEmail,
  // Emails commandes
  sendNewOrderAdminEmail,
  sendOrderConfirmedEmail,
  sendOrderShippedEmail,
  sendContactEmail,
  oauth2Client
};
