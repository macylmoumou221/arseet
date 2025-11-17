/**
 * Liste complète des 58 wilayas d'Algérie
 * Mise à jour: 2019 (ajout de 10 nouvelles wilayas)
 */

const WILAYAS = [
  // Wilayas 1-48 (Originales)
  { code: '01', nom: 'Adrar', capitale: 'Adrar' },
  { code: '02', nom: 'Chlef', capitale: 'Chlef' },
  { code: '03', nom: 'Laghouat', capitale: 'Laghouat' },
  { code: '04', nom: 'Oum El Bouaghi', capitale: 'Oum El Bouaghi' },
  { code: '05', nom: 'Batna', capitale: 'Batna' },
  { code: '06', nom: 'Béjaïa', capitale: 'Béjaïa' },
  { code: '07', nom: 'Biskra', capitale: 'Biskra' },
  { code: '08', nom: 'Béchar', capitale: 'Béchar' },
  { code: '09', nom: 'Blida', capitale: 'Blida' },
  { code: '10', nom: 'Bouira', capitale: 'Bouira' },
  { code: '11', nom: 'Tamanrasset', capitale: 'Tamanrasset' },
  { code: '12', nom: 'Tébessa', capitale: 'Tébessa' },
  { code: '13', nom: 'Tlemcen', capitale: 'Tlemcen' },
  { code: '14', nom: 'Tiaret', capitale: 'Tiaret' },
  { code: '15', nom: 'Tizi Ouzou', capitale: 'Tizi Ouzou' },
  { code: '16', nom: 'Alger', capitale: 'Alger' },
  { code: '17', nom: 'Djelfa', capitale: 'Djelfa' },
  { code: '18', nom: 'Jijel', capitale: 'Jijel' },
  { code: '19', nom: 'Sétif', capitale: 'Sétif' },
  { code: '20', nom: 'Saïda', capitale: 'Saïda' },
  { code: '21', nom: 'Skikda', capitale: 'Skikda' },
  { code: '22', nom: 'Sidi Bel Abbès', capitale: 'Sidi Bel Abbès' },
  { code: '23', nom: 'Annaba', capitale: 'Annaba' },
  { code: '24', nom: 'Guelma', capitale: 'Guelma' },
  { code: '25', nom: 'Constantine', capitale: 'Constantine' },
  { code: '26', nom: 'Médéa', capitale: 'Médéa' },
  { code: '27', nom: 'Mostaganem', capitale: 'Mostaganem' },
  { code: '28', nom: "M'Sila", capitale: "M'Sila" },
  { code: '29', nom: 'Mascara', capitale: 'Mascara' },
  { code: '30', nom: 'Ouargla', capitale: 'Ouargla' },
  { code: '31', nom: 'Oran', capitale: 'Oran' },
  { code: '32', nom: 'El Bayadh', capitale: 'El Bayadh' },
  { code: '33', nom: 'Illizi', capitale: 'Illizi' },
  { code: '34', nom: 'Bordj Bou Arréridj', capitale: 'Bordj Bou Arréridj' },
  { code: '35', nom: 'Boumerdès', capitale: 'Boumerdès' },
  { code: '36', nom: 'El Tarf', capitale: 'El Tarf' },
  { code: '37', nom: 'Tindouf', capitale: 'Tindouf' },
  { code: '38', nom: 'Tissemsilt', capitale: 'Tissemsilt' },
  { code: '39', nom: 'El Oued', capitale: 'El Oued' },
  { code: '40', nom: 'Khenchela', capitale: 'Khenchela' },
  { code: '41', nom: 'Souk Ahras', capitale: 'Souk Ahras' },
  { code: '42', nom: 'Tipaza', capitale: 'Tipaza' },
  { code: '43', nom: 'Mila', capitale: 'Mila' },
  { code: '44', nom: 'Aïn Defla', capitale: 'Aïn Defla' },
  { code: '45', nom: 'Naâma', capitale: 'Naâma' },
  { code: '46', nom: 'Aïn Témouchent', capitale: 'Aïn Témouchent' },
  { code: '47', nom: 'Ghardaïa', capitale: 'Ghardaïa' },
  { code: '48', nom: 'Relizane', capitale: 'Relizane' },
  
  // Nouvelles wilayas 49-58 (ajoutées en 2019)
  { code: '49', nom: 'Timimoun', capitale: 'Timimoun' },
  { code: '50', nom: 'Bordj Badji Mokhtar', capitale: 'Bordj Badji Mokhtar' },
  { code: '51', nom: 'Ouled Djellal', capitale: 'Ouled Djellal' },
  { code: '52', nom: 'Béni Abbès', capitale: 'Béni Abbès' },
  { code: '53', nom: 'In Salah', capitale: 'In Salah' },
  { code: '54', nom: 'In Guezzam', capitale: 'In Guezzam' },
  { code: '55', nom: 'Touggourt', capitale: 'Touggourt' },
  { code: '56', nom: 'Djanet', capitale: 'Djanet' },
  { code: '57', nom: "El M'Ghair", capitale: "El M'Ghair" },
  { code: '58', nom: 'El Meniaa', capitale: 'El Meniaa' }
];

// Export de la liste des noms uniquement (pour ENUM)
const WILAYAS_ENUM = WILAYAS.map(w => w.nom);

// Export de la liste complète
const WILAYAS_COMPLETE = WILAYAS;

// Fonction pour obtenir une wilaya par code
const getWilayaByCode = (code) => {
  return WILAYAS.find(w => w.code === code.toString().padStart(2, '0'));
};

// Fonction pour obtenir une wilaya par nom
const getWilayaByNom = (nom) => {
  return WILAYAS.find(w => w.nom.toLowerCase() === nom.toLowerCase());
};

// Fonction pour valider une wilaya
const isValidWilaya = (nom) => {
  return WILAYAS_ENUM.includes(nom);
};

module.exports = {
  WILAYAS,
  WILAYAS_ENUM,
  WILAYAS_COMPLETE,
  getWilayaByCode,
  getWilayaByNom,
  isValidWilaya
};
