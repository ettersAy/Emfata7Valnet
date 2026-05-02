/**
 * Spanish translations for مفاتيح
 */
export default {
  appName: "Llaves",
  appSubtitle: "Gestor de contraseñas seguro",
  searchPlaceholder: "🔍 Buscar…",

  /* ── Vault Gate ────────────────────────────────────────── */
  vaultLocked: "Cofre bloqueado",
  masterPasswordPlaceholder: "Ingrese la contraseña maestra…",
  togglePasswordVisibility: "Mostrar/Ocultar contraseña",
  unlockBtn: "Desbloquear",
  createVaultBtn: "Crear cofre",
  vaultHintConfigured: "Ingrese su contraseña maestra una vez al día.",
  vaultHintNew: "Cree su contraseña maestra para cifrar el cofre.",
  minLengthError: "Use al menos 4 caracteres.",
  invalidMasterPassword: "Contraseña maestra inválida.",
  vaultUnlocked: "Cofre desbloqueado.",
  lockVaultTitle: "Bloquear cofre",

  /* ── Password Strength ─────────────────────────────────── */
  strengthWeak: "Débil — agregue más variedad",
  strengthFair: "Aceptable",
  strengthGood: "Buena — casi fuerte",
  strengthStrong: "Fuerte — ¡excelente!",

  /* ── List / Entries ────────────────────────────────────── */
  entriesCount: "{count} entradas",
  entriesCountFiltered: "{visible} / {total}",
  noEntriesYet: "Aún no hay entradas",
  emptyStateMessage: "Haga clic en el botón + arriba para agregar su primera contraseña.",
  expandListBtn: "📋 Llaves ({count})",

  /* ── Row Actions ────────────────────────────────────────── */
  openSiteTitle: "Abrir {url} — doble clic para copiar URL",
  editEntryTitle: "Editar entrada",
  deleteEntryTitle: "Eliminar entrada",
  dragHandleTitle: "Arrastrar para reordenar",
  minimizeEntryTitle: "Minimizar al fondo",

  /* ── Credential Pairs ──────────────────────────────────── */
  showPasswordTitle: "Mostrar contraseña",
  hidePasswordTitle: "Ocultar contraseña",
  fillCredentialsTitle: "Rellenar credenciales",
  credentialsListTitle: "Credenciales",
  addCredentialBtn: "+ Agregar credenciales",
  addCredentialRowTitle: "Agregar credenciales a esta entrada",

  /* ── Toast Messages ────────────────────────────────────── */
  deletedSuccess: "Eliminado.",
  copied: "¡Copiado!",
  copiedUsername: "Nombre de usuario copiado.",
  copiedPassword: "Contraseña copiada.",
  copiedUrl: "URL copiada.",
  notAValidUrl: "Esta entrada no es una dirección web válida.",
  encryptedDataMissing: "Faltan datos cifrados.",
  decryptionFailed: "Descifrado fallido.",
  hostMismatch: "Autocompletado fallido: el nombre de host no coincide.",
  autofillSuccess: "Autocompletado exitoso.",
  savedSuccess: "¡Guardado!",

  /* ── Dialog ────────────────────────────────────────────── */
  addSiteTitle: "Agregar sitio",
  editSiteTitle: "Editar sitio",
  siteUrlLabel: "Sitio / Alias",
  siteUrlPlaceholder: "example.com o cualquier nota",
  siteLoginLabel: "Nombre de usuario / Correo",
  siteLoginPlaceholder: "user@example.com",
  sitePasswordLabel: "Contraseña",
  sitePasswordPlaceholder: "Contraseña",
  cancelBtn: "Cancelar",
  saveBtn: "Guardar",
  addBtn: "Agregar entrada",

  /* ── Options / Settings ────────────────────────────────── */
  settingsTitle: "⚙ Ajustes",
  settingsSubtitle: "Personalice las palabras clave de detección de campos, exportación e importación.",

  /* ── Language Selector ─────────────────────────────────── */
  languageLabel: "🌐 Idioma",

  /* ── User Keywords Card ────────────────────────────────── */
  userKeywordsTitle: "🔑 Palabras clave del campo de usuario",
  userKeywordsDesc: "Palabras separadas por comas para identificar campos de nombre de usuario / correo.",
  userKeywordsLabel: "Palabras clave",
  userKeywordsPlaceholder: "email, user, username, login, identifier",

  /* ── Password Keywords Card ────────────────────────────── */
  passwordKeywordsTitle: "🔒 Palabras clave del campo de contraseña",
  passwordKeywordsDesc: "Palabras separadas por comas para identificar campos de contraseña.",
  passwordKeywordsLabel: "Palabras clave",
  passwordKeywordsPlaceholder: "password, pwd, passcode, pin",

  /* ── Save Settings ─────────────────────────────────────── */
  saveSettingsBtn: "💾 Guardar ajustes",
  saveSuccess: "✅ Ajustes guardados correctamente.",

  /* ── Change Master Key ─────────────────────────────────── */
  changeMasterKeyTitle: "🔐 Cambiar la contraseña maestra",
  changeMasterKeyDesc: "Todos los datos del cofre se descifrarán y volverán a cifrar con la nueva clave.",
  currentMasterKeyLabel: "Contraseña maestra actual",
  newMasterKeyLabel: "Nueva contraseña maestra",
  confirmMasterKeyLabel: "Confirmar la nueva contraseña maestra",
  changeMasterKeyBtn: "🔐 Cambiar clave",
  masterKeyMismatch: "❌ Las nuevas claves no coinciden.",
  masterKeyChangeSuccess: "✅ Clave maestra cambiada correctamente. Todos los datos han sido recifrados.",
  masterKeyChangeFailed: "❌ No se pudo cambiar la clave maestra. Verifique su clave actual.",
  masterKeySamePassword: "⚠ La nueva clave es igual a la clave actual.",
  currentMasterKeyPlaceholder: "Ingrese la contraseña maestra actual",
  newMasterKeyPlaceholder: "Ingrese la nueva contraseña maestra (al menos 4 caracteres)",
  confirmMasterKeyPlaceholder: "Vuelva a ingresar la nueva contraseña maestra",

  /* ── Export ────────────────────────────────────────────── */
  exportTitle: "📤 Exportar cofre",
  exportDesc: "Exportar todos los datos del cofre (cifrados) como JSON o CSV.",
  exportJsonBtn: "📦 Exportar JSON",
  exportCsvBtn: "📊 Exportar CSV",
  exportNoData: "⚠ No hay datos para exportar.",
  exportSuccess: "✅ {count} entradas exportadas correctamente.",
  exportFailed: "❌ Exportación fallida: {message}",

  /* ── Import ────────────────────────────────────────────── */
  importTitle: "📥 Importar cofre",
  importDesc: "Importar datos desde un archivo JSON o CSV exportado previamente.",
  importWarning: "⚠ Advertencia: ¡La importación reemplazará todos los datos existentes!",
  importFileLabel: "Seleccionar archivo",
  importBtn: "📥 Importar",
  importNoFile: "⚠ Por favor seleccione un archivo.",
  importInvalidFormat: "Formato de archivo no compatible. Use JSON o CSV.",
  importNoValidData: "⚠ El archivo no contiene datos válidos.",
  importInvalidEntry: "Archivo inválido: cada entrada necesita id y url.",
  importSuccess: "✅ {count} entradas importadas correctamente.",
  importFailed: "❌ Importación fallida: {message}",
};
