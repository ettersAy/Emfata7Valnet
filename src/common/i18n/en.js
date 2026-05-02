/**
 * English translations for مفاتيح
 */
export default {
  appName: "Keys",
  appSubtitle: "Secure Password Manager",
  searchPlaceholder: "🔍 Search…",

  /* ── Vault Gate ────────────────────────────────────────── */
  vaultLocked: "Vault Locked",
  masterPasswordPlaceholder: "Enter master password…",
  togglePasswordVisibility: "Toggle password visibility",
  unlockBtn: "Unlock",
  createVaultBtn: "Create Vault",
  vaultHintConfigured: "Enter your master password once daily.",
  vaultHintNew: "Create your master password to encrypt the vault.",
  minLengthError: "Use at least 4 characters.",
  invalidMasterPassword: "Invalid master password.",
  vaultUnlocked: "Vault unlocked.",
  lockVaultTitle: "Lock vault",

  /* ── Password Strength ─────────────────────────────────── */
  strengthWeak: "Weak — add more variety",
  strengthFair: "Fair",
  strengthGood: "Good — almost strong",
  strengthStrong: "Strong — excellent!",

  /* ── List / Entries ────────────────────────────────────── */
  entriesCount: "{count} entries",
  entriesCountFiltered: "{visible} / {total}",
  noEntriesYet: "No entries yet",
  emptyStateMessage: "Click the + button above to add your first password.",
  expandListBtn: "📋 Keys ({count})",

  /* ── Row Actions ────────────────────────────────────────── */
  openSiteTitle: "Open {url} — double-click to copy URL",
  editEntryTitle: "Edit entry",
  deleteEntryTitle: "Delete entry",
  dragHandleTitle: "Drag to reorder",
  minimizeEntryTitle: "Minimize to bottom",

  /* ── Credential Pairs ──────────────────────────────────── */
  showPasswordTitle: "Show password",
  hidePasswordTitle: "Hide password",
  fillCredentialsTitle: "Fill credentials",
  credentialsListTitle: "Credentials",
  addCredentialBtn: "+ Add credentials",
  addCredentialRowTitle: "Add credentials to this entry",

  /* ── Toast Messages ────────────────────────────────────── */
  deletedSuccess: "Deleted.",
  copied: "Copied!",
  copiedUsername: "Username copied.",
  copiedPassword: "Password copied.",
  copiedUrl: "URL copied.",
  notAValidUrl: "This entry is not a valid web address.",
  encryptedDataMissing: "Encrypted data missing.",
  decryptionFailed: "Decryption failed.",
  hostMismatch: "Autofill failed: hostname mismatch.",
  autofillSuccess: "Autofilled successfully.",
  savedSuccess: "Saved!",

  /* ── Dialog ────────────────────────────────────────────── */
  addSiteTitle: "Add Site",
  editSiteTitle: "Edit Site",
  siteUrlLabel: "Site / Alias",
  siteUrlPlaceholder: "example.com or any note",
  siteLoginLabel: "Username / Email",
  siteLoginPlaceholder: "user@example.com",
  sitePasswordLabel: "Password",
  sitePasswordPlaceholder: "Password",
  cancelBtn: "Cancel",
  saveBtn: "Save",
  addBtn: "Add entry",

  /* ── Options / Settings ────────────────────────────────── */
  settingsTitle: "⚙ Settings",
  settingsSubtitle: "Customize field detection keywords, export, and import.",

  /* ── Language Selector ─────────────────────────────────── */
  languageLabel: "🌐 Language",

  /* ── User Keywords Card ────────────────────────────────── */
  userKeywordsTitle: "🔑 User Field Keywords",
  userKeywordsDesc: "Comma-separated words to identify username/email fields.",
  userKeywordsLabel: "Keywords",
  userKeywordsPlaceholder: "email, user, username, login, identifier",

  /* ── Password Keywords Card ────────────────────────────── */
  passwordKeywordsTitle: "🔒 Password Field Keywords",
  passwordKeywordsDesc: "Comma-separated words to identify password fields.",
  passwordKeywordsLabel: "Keywords",
  passwordKeywordsPlaceholder: "password, pwd, passcode, pin",

  /* ── Save Settings ─────────────────────────────────────── */
  saveSettingsBtn: "💾 Save Settings",
  saveSuccess: "✅ Settings saved successfully.",

  /* ── Change Master Key ─────────────────────────────────── */
  changeMasterKeyTitle: "🔐 Change Master Key",
  changeMasterKeyDesc: "All vault data will be decrypted and re-encrypted with the new key.",
  currentMasterKeyLabel: "Current Master Key",
  newMasterKeyLabel: "New Master Key",
  confirmMasterKeyLabel: "Confirm New Master Key",
  changeMasterKeyBtn: "🔐 Change Key",
  masterKeyMismatch: "❌ New keys do not match.",
  masterKeyChangeSuccess: "✅ Master key changed successfully. All data has been re-encrypted.",
  masterKeyChangeFailed: "❌ Failed to change master key. Check your current key.",
  masterKeySamePassword: "⚠ New key is the same as the current key.",
  currentMasterKeyPlaceholder: "Enter current master key",
  newMasterKeyPlaceholder: "Enter new master key (at least 4 characters)",
  confirmMasterKeyPlaceholder: "Re-enter new master key",

  /* ── Export ────────────────────────────────────────────── */
  exportTitle: "📤 Export Vault",
  exportDesc: "Export all vault data (encrypted) as JSON or CSV.",
  exportJsonBtn: "📦 Export JSON",
  exportCsvBtn: "📊 Export CSV",
  exportNoData: "⚠ No data to export.",
  exportSuccess: "✅ Exported {count} entries successfully.",
  exportFailed: "❌ Export failed: {message}",

  /* ── Import ────────────────────────────────────────────── */
  importTitle: "📥 Import Vault",
  importDesc: "Import data from a previously exported JSON or CSV file.",
  importWarning: "⚠ Warning: Import will replace all existing data!",
  importFileLabel: "Choose file",
  importBtn: "📥 Import",
  importNoFile: "⚠ Please select a file.",
  importInvalidFormat: "Unsupported file format. Use JSON or CSV.",
  importNoValidData: "⚠ The file contains no valid data.",
  importInvalidEntry: "Invalid file: each entry needs id and url.",
  importSuccess: "✅ Imported {count} entries successfully.",
  importFailed: "❌ Import failed: {message}",
};
