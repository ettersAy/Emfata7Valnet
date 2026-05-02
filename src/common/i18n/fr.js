/**
 * French translations for مفاتيح
 */
export default {
  appName: "Clés",
  appSubtitle: "Gestionnaire de mots de passe sécurisé",
  searchPlaceholder: "🔍 Rechercher…",

  /* ── Vault Gate ────────────────────────────────────────── */
  vaultLocked: "Coffre verrouillé",
  masterPasswordPlaceholder: "Entrez le mot de passe principal…",
  togglePasswordVisibility: "Afficher/Masquer le mot de passe",
  unlockBtn: "Déverrouiller",
  createVaultBtn: "Créer le coffre",
  vaultHintConfigured: "Entrez votre mot de passe principal une fois par jour.",
  vaultHintNew: "Créez votre mot de passe principal pour chiffrer le coffre.",
  minLengthError: "Utilisez au moins 4 caractères.",
  invalidMasterPassword: "Mot de passe principal invalide.",
  vaultUnlocked: "Coffre déverrouillé.",
  lockVaultTitle: "Verrouiller le coffre",

  /* ── Password Strength ─────────────────────────────────── */
  strengthWeak: "Faible — ajoutez plus de variété",
  strengthFair: "Acceptable",
  strengthGood: "Bon — presque fort",
  strengthStrong: "Fort — excellent !",

  /* ── List / Entries ────────────────────────────────────── */
  entriesCount: "{count} entrées",
  entriesCountFiltered: "{visible} / {total}",
  noEntriesYet: "Aucune entrée pour l'instant",
  emptyStateMessage: "Cliquez sur le bouton + ci-dessus pour ajouter votre premier mot de passe.",
  expandListBtn: "📋 Clés ({count})",

  /* ── Row Actions ────────────────────────────────────────── */
  openSiteTitle: "Ouvrir {url} — double-clic pour copier l'URL",
  editEntryTitle: "Modifier l'entrée",
  deleteEntryTitle: "Supprimer l'entrée",
  dragHandleTitle: "Glisser pour réorganiser",
  minimizeEntryTitle: "Réduire en bas",

  /* ── Credential Pairs ──────────────────────────────────── */
  showPasswordTitle: "Afficher le mot de passe",
  hidePasswordTitle: "Masquer le mot de passe",
  fillCredentialsTitle: "Remplir les identifiants",
  credentialsListTitle: "Identifiants",
  addCredentialBtn: "+ Ajouter des identifiants",
  addCredentialRowTitle: "Ajouter des identifiants à cette entrée",

  /* ── Toast Messages ────────────────────────────────────── */
  deletedSuccess: "Supprimé.",
  copied: "Copié !",
  copiedUsername: "Nom d'utilisateur copié.",
  copiedPassword: "Mot de passe copié.",
  copiedUrl: "URL copiée.",
  notAValidUrl: "Cette entrée n'est pas une adresse web valide.",
  encryptedDataMissing: "Données chiffrées manquantes.",
  decryptionFailed: "Échec du déchiffrement.",
  hostMismatch: "Remplissage automatique impossible : nom d'hôte non correspondant.",
  autofillSuccess: "Remplissage automatique réussi.",
  savedSuccess: "Enregistré !",

  /* ── Dialog ────────────────────────────────────────────── */
  addSiteTitle: "Ajouter un site",
  editSiteTitle: "Modifier le site",
  siteUrlLabel: "Site / Alias",
  siteUrlPlaceholder: "example.com ou toute note",
  siteLoginLabel: "Nom d'utilisateur / Email",
  siteLoginPlaceholder: "user@example.com",
  sitePasswordLabel: "Mot de passe",
  sitePasswordPlaceholder: "Mot de passe",
  cancelBtn: "Annuler",
  saveBtn: "Enregistrer",
  addBtn: "Ajouter une entrée",

  /* ── Options / Settings ────────────────────────────────── */
  settingsTitle: "⚙ Paramètres",
  settingsSubtitle: "Personnalisez les mots-clés de détection des champs, l'export et l'import.",

  /* ── Language Selector ─────────────────────────────────── */
  languageLabel: "🌐 Langue",

  /* ── User Keywords Card ────────────────────────────────── */
  userKeywordsTitle: "🔑 Mots-clés du champ utilisateur",
  userKeywordsDesc: "Mots séparés par des virgules pour identifier les champs nom d'utilisateur / email.",
  userKeywordsLabel: "Mots-clés",
  userKeywordsPlaceholder: "email, user, username, login, identifier",

  /* ── Password Keywords Card ────────────────────────────── */
  passwordKeywordsTitle: "🔒 Mots-clés du champ mot de passe",
  passwordKeywordsDesc: "Mots séparés par des virgules pour identifier les champs de mot de passe.",
  passwordKeywordsLabel: "Mots-clés",
  passwordKeywordsPlaceholder: "password, pwd, passcode, pin",

  /* ── Save Settings ─────────────────────────────────────── */
  saveSettingsBtn: "💾 Enregistrer les paramètres",
  saveSuccess: "✅ Paramètres enregistrés avec succès.",

  /* ── Change Master Key ─────────────────────────────────── */
  changeMasterKeyTitle: "🔐 Changer le mot de passe principal",
  changeMasterKeyDesc: "Toutes les données du coffre seront déchiffrées et rechiffrées avec la nouvelle clé.",
  currentMasterKeyLabel: "Mot de passe principal actuel",
  newMasterKeyLabel: "Nouveau mot de passe principal",
  confirmMasterKeyLabel: "Confirmer le nouveau mot de passe principal",
  changeMasterKeyBtn: "🔐 Changer la clé",
  masterKeyMismatch: "❌ Les nouvelles clés ne correspondent pas.",
  masterKeyChangeSuccess: "✅ Clé principale modifiée avec succès. Toutes les données ont été rechiffrées.",
  masterKeyChangeFailed: "❌ Échec du changement de clé principale. Vérifiez votre clé actuelle.",
  masterKeySamePassword: "⚠ La nouvelle clé est identique à la clé actuelle.",
  currentMasterKeyPlaceholder: "Entrez le mot de passe principal actuel",
  newMasterKeyPlaceholder: "Entrez le nouveau mot de passe principal (4 caractères minimum)",
  confirmMasterKeyPlaceholder: "Ressaisissez le nouveau mot de passe principal",

  /* ── Export ────────────────────────────────────────────── */
  exportTitle: "📤 Exporter le coffre",
  exportDesc: "Exporter toutes les données du coffre (chiffrées) en JSON ou CSV.",
  exportJsonBtn: "📦 Exporter JSON",
  exportCsvBtn: "📊 Exporter CSV",
  exportNoData: "⚠ Aucune donnée à exporter.",
  exportSuccess: "✅ {count} entrées exportées avec succès.",
  exportFailed: "❌ Échec de l'export : {message}",

  /* ── Import ────────────────────────────────────────────── */
  importTitle: "📥 Importer le coffre",
  importDesc: "Importer des données depuis un fichier JSON ou CSV exporté précédemment.",
  importWarning: "⚠ Attention : L'import remplacera toutes les données existantes !",
  importFileLabel: "Choisir un fichier",
  importBtn: "📥 Importer",
  importNoFile: "⚠ Veuillez sélectionner un fichier.",
  importInvalidFormat: "Format de fichier non pris en charge. Utilisez JSON ou CSV.",
  importNoValidData: "⚠ Le fichier ne contient pas de données valides.",
  importInvalidEntry: "Fichier invalide : chaque entrée nécessite un id et une url.",
  importSuccess: "✅ {count} entrées importées avec succès.",
  importFailed: "❌ Échec de l'import : {message}",
};
