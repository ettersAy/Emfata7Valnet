/**
 * i18n — Translation module for مفاتيح
 * Supports: Arabic (ar), English (en), French (fr), Spanish (es), Hindi (hi), Chinese (zh)
 */

const LANGUAGES = {
  ar: { name: "العربية", dir: "rtl" },
  en: { name: "English", dir: "ltr" },
  fr: { name: "Français", dir: "ltr" },
  es: { name: "Español", dir: "ltr" },
  hi: { name: "हिन्दी", dir: "ltr" },
  zh: { name: "中文", dir: "ltr" },
};

const TRANSLATIONS = {
  /* ── App / General ─────────────────────────────────────── */
  appName: {
    ar: "مفاتيح", en: "Keys", fr: "Clés", es: "Llaves", hi: "चाबियाँ", zh: "钥匙",
  },
  appSubtitle: {
    ar: "مدير كلمات المرور الآمن", en: "Secure Password Manager", fr: "Gestionnaire de mots de passe sécurisé",
    es: "Gestor de contraseñas seguro", hi: "सुरक्षित पासवर्ड प्रबंधक", zh: "安全密码管理器",
  },
  searchPlaceholder: {
    ar: "🔍 بحث…", en: "🔍 Search…", fr: "🔍 Rechercher…",
    es: "🔍 Buscar…", hi: "🔍 खोजें…", zh: "🔍 搜索…",
  },

  /* ── Vault Gate ────────────────────────────────────────── */
  vaultLocked: {
    ar: "الخزنة مقفلة", en: "Vault Locked", fr: "Coffre verrouillé",
    es: "Cofre bloqueado", hi: "तिजोरी बंद है", zh: "保险库已锁定",
  },
  masterPasswordPlaceholder: {
    ar: "أدخل المفتاح الرئيسي…", en: "Enter master password…", fr: "Entrez le mot de passe principal…",
    es: "Ingrese la contraseña maestra…", hi: "मास्टर पासवर्ड दर्ज करें…", zh: "输入主密码…",
  },
  togglePasswordVisibility: {
    ar: "إظهار كلمة المرور", en: "Toggle password visibility", fr: "Afficher/Masquer le mot de passe",
    es: "Mostrar/Ocultar contraseña", hi: "पासवर्ड दृश्यता टॉगल करें", zh: "切换密码可见性",
  },
  unlockBtn: {
    ar: "فتح", en: "Unlock", fr: "Déverrouiller", es: "Desbloquear", hi: "अनलॉक करें", zh: "解锁",
  },
  createVaultBtn: {
    ar: "إنشاء الخزنة", en: "Create Vault", fr: "Créer le coffre",
    es: "Crear cofre", hi: "तिजोरी बनाएं", zh: "创建保险库",
  },
  vaultHintConfigured: {
    ar: "أدخل المفتاح الرئيسي مرة واحدة يومياً.", en: "Enter your master password once daily.",
    fr: "Entrez votre mot de passe principal une fois par jour.",
    es: "Ingrese su contraseña maestra una vez al día.",
    hi: "दिन में एक बार अपना मास्टर पासवर्ड दर्ज करें।",
    zh: "每天输入一次您的主密码。",
  },
  vaultHintNew: {
    ar: "أنشئ مفتاحك الرئيسي لتشفير الخزنة.", en: "Create your master password to encrypt the vault.",
    fr: "Créez votre mot de passe principal pour chiffrer le coffre.",
    es: "Cree su contraseña maestra para cifrar el cofre.",
    hi: "तिजोरी को एन्क्रिप्ट करने के लिए अपना मास्टर पासवर्ड बनाएं।",
    zh: "创建您的主密码以加密保险库。",
  },
  minLengthError: {
    ar: "استخدم 4 أحرف على الأقل.", en: "Use at least 4 characters.",
    fr: "Utilisez au moins 4 caractères.", es: "Use al menos 4 caracteres.",
    hi: "कम से कम 4 अक्षरों का उपयोग करें।", zh: "请至少使用4个字符。",
  },
  invalidMasterPassword: {
    ar: "مفتاح رئيسي غير صالح.", en: "Invalid master password.",
    fr: "Mot de passe principal invalide.", es: "Contraseña maestra inválida.",
    hi: "अमान्य मास्टर पासवर्ड।", zh: "主密码无效。",
  },
  vaultUnlocked: {
    ar: "تم فتح الخزنة.", en: "Vault unlocked.", fr: "Coffre déverrouillé.",
    es: "Cofre desbloqueado.", hi: "तिजोरी अनलॉक हुई।", zh: "保险库已解锁。",
  },
  lockVaultTitle: {
    ar: "قفل الخزنة", en: "Lock vault", fr: "Verrouiller le coffre",
    es: "Bloquear cofre", hi: "तिजोरी बंद करें", zh: "锁定保险库",
  },

  /* ── Password Strength ─────────────────────────────────── */
  strengthWeak: {
    ar: "ضعيف — أضف تنوعاً أكثر", en: "Weak — add more variety",
    fr: "Faible — ajoutez plus de variété", es: "Débil — agregue más variedad",
    hi: "कमज़ोर — और विविधता जोड़ें", zh: "弱 — 增加更多种类",
  },
  strengthFair: {
    ar: "مقبول", en: "Fair", fr: "Acceptable", es: "Aceptable", hi: "मध्यम", zh: "一般",
  },
  strengthGood: {
    ar: "جيد — يكاد يكون قوياً", en: "Good — almost strong",
    fr: "Bon — presque fort", es: "Buena — casi fuerte",
    hi: "अच्छा — लगभग मजबूत", zh: "好 — 几乎强",
  },
  strengthStrong: {
    ar: "قوي — ممتاز!", en: "Strong — excellent!",
    fr: "Fort — excellent !", es: "Fuerte — ¡excelente!",
    hi: "मजबूत — उत्कृष्ट!", zh: "强 — 优秀！",
  },

  /* ── List / Entries ────────────────────────────────────── */
  entriesCount: {
    ar: "{count} مدخلات", en: "{count} entries", fr: "{count} entrées",
    es: "{count} entradas", hi: "{count} प्रविष्टियाँ", zh: "{count} 条目",
  },
  entriesCountFiltered: {
    ar: "{visible} / {total}", en: "{visible} / {total}", fr: "{visible} / {total}",
    es: "{visible} / {total}", hi: "{visible} / {total}", zh: "{visible} / {total}",
  },
  noEntriesYet: {
    ar: "لا توجد مفاتيح بعد", en: "No entries yet", fr: "Aucune entrée pour l'instant",
    es: "Aún no hay entradas", hi: "अभी तक कोई प्रविष्टि नहीं", zh: "尚无条目",
  },
  emptyStateMessage: {
    ar: "انقر على زر + أعلاه لإضافة أول كلمة مرور.",
    en: "Click the + button above to add your first password.",
    fr: "Cliquez sur le bouton + ci-dessus pour ajouter votre premier mot de passe.",
    es: "Haga clic en el botón + arriba para agregar su primera contraseña.",
    hi: "अपना पहला पासवर्ड जोड़ने के लिए ऊपर + बटन पर क्लिक करें।",
    zh: "点击上面的+按钮添加您的第一个密码。",
  },
  expandListBtn: {
    ar: "📋 المفاتيح ({count})", en: "📋 Keys ({count})", fr: "📋 Clés ({count})",
    es: "📋 Llaves ({count})", hi: "📋 चाबियाँ ({count})", zh: "📋 钥匙 ({count})",
  },

  /* ── Row Actions ────────────────────────────────────────── */
  openSiteTitle: {
    ar: "فتح {url} — انقر مرتين لنسخ الرابط",
    en: "Open {url} — double-click to copy URL",
    fr: "Ouvrir {url} — double-clic pour copier l'URL",
    es: "Abrir {url} — doble clic para copiar URL",
    hi: "{url} खोलें — URL कॉपी करने के लिए डबल-क्लिक करें",
    zh: "打开 {url} — 双击复制URL",
  },
  editEntryTitle: {
    ar: "تعديل الإدخال", en: "Edit entry", fr: "Modifier l'entrée",
    es: "Editar entrada", hi: "प्रविष्टि संपादित करें", zh: "编辑条目",
  },
  deleteEntryTitle: {
    ar: "حذف الإدخال", en: "Delete entry", fr: "Supprimer l'entrée",
    es: "Eliminar entrada", hi: "प्रविष्टि हटाएं", zh: "删除条目",
  },
  dragHandleTitle: {
    ar: "اسحب لإعادة الترتيب", en: "Drag to reorder",
    fr: "Glisser pour réorganiser", es: "Arrastrar para reordenar",
    hi: "पुनर्क्रमित करने के लिए खींचें", zh: "拖拽以重新排序",
  },
  minimizeEntryTitle: {
    ar: "تصغير إلى الأسفل", en: "Minimize to bottom",
    fr: "Réduire en bas", es: "Minimizar al fondo",
    hi: "नीचे छोटा करें", zh: "最小化到底部",
  },

  /* ── Credential Pairs ──────────────────────────────────── */
  showPasswordTitle: {
    ar: "إظهار كلمة المرور", en: "Show password", fr: "Afficher le mot de passe",
    es: "Mostrar contraseña", hi: "पासवर्ड दिखाएं", zh: "显示密码",
  },
  hidePasswordTitle: {
    ar: "إخفاء كلمة المرور", en: "Hide password", fr: "Masquer le mot de passe",
    es: "Ocultar contraseña", hi: "पासवर्ड छिपाएं", zh: "隐藏密码",
  },
  fillCredentialsTitle: {
    ar: "ملء بيانات الدخول", en: "Fill credentials", fr: "Remplir les identifiants",
    es: "Rellenar credenciales", hi: "क्रेडेंशियल भरें", zh: "填写凭据",
  },
  credentialsListTitle: {
    ar: "بيانات الدخول", en: "Credentials", fr: "Identifiants",
    es: "Credenciales", hi: "क्रेडेंशियल", zh: "凭据",
  },
  addCredentialBtn: {
    ar: "+ إضافة بيانات دخول", en: "+ Add credentials", fr: "+ Ajouter des identifiants",
    es: "+ Agregar credenciales", hi: "+ क्रेडेंशियल जोड़ें", zh: "+ 添加凭据",
  },

  /* ── Toast Messages ────────────────────────────────────── */
  deletedSuccess: {
    ar: "تم الحذف.", en: "Deleted.", fr: "Supprimé.",
    es: "Eliminado.", hi: "हटा दिया गया।", zh: "已删除。",
  },
  copied: {
    ar: "تم النسخ!", en: "Copied!", fr: "Copié !",
    es: "¡Copiado!", hi: "कॉपी हो गया!", zh: "已复制！",
  },
  copiedUsername: {
    ar: "تم نسخ اسم المستخدم.", en: "Username copied.",
    fr: "Nom d'utilisateur copié.", es: "Nombre de usuario copiado.",
    hi: "उपयोगकर्ता नाम कॉपी हो गया।", zh: "用户名已复制。",
  },
  copiedPassword: {
    ar: "تم نسخ كلمة المرور.", en: "Password copied.",
    fr: "Mot de passe copié.", es: "Contraseña copiada.",
    hi: "पासवर्ड कॉपी हो गया।", zh: "密码已复制。",
  },
  copiedUrl: {
    ar: "تم نسخ الرابط.", en: "URL copied.",
    fr: "URL copiée.", es: "URL copiada.",
    hi: "URL कॉपी हो गया।", zh: "URL已复制。",
  },
  notAValidUrl: {
    ar: "هذا الإدخال ليس عنوان ويب صالح.", en: "This entry is not a valid web address.",
    fr: "Cette entrée n'est pas une adresse web valide.",
    es: "Esta entrada no es una dirección web válida.",
    hi: "यह प्रविष्टि कोई मान्य वेब पता नहीं है।",
    zh: "此条目不是有效的网址。",
  },
  encryptedDataMissing: {
    ar: "بيانات مشفرة مفقودة.", en: "Encrypted data missing.",
    fr: "Données chiffrées manquantes.", es: "Faltan datos cifrados.",
    hi: "एन्क्रिप्टेड डेटा गायब है।", zh: "加密数据丢失。",
  },
  decryptionFailed: {
    ar: "فشل فك التشفير.", en: "Decryption failed.",
    fr: "Échec du déchiffrement.", es: "Descifrado fallido.",
    hi: "डिक्रिप्शन विफल।", zh: "解密失败。",
  },
  hostMismatch: {
    ar: "تعذر الملء التلقائي: اسم المضيف غير متطابق.",
    en: "Autofill failed: hostname mismatch.",
    fr: "Remplissage automatique impossible : nom d'hôte non correspondant.",
    es: "Autocompletado fallido: el nombre de host no coincide.",
    hi: "ऑटोफ़िल विफल: होस्टनेम मेल नहीं खाता।",
    zh: "自动填充失败：主机名不匹配。",
  },
  autofillSuccess: {
    ar: "تم ملء البيانات تلقائياً.", en: "Autofilled successfully.",
    fr: "Remplissage automatique réussi.", es: "Autocompletado exitoso.",
    hi: "स्वतः भरा गया।", zh: "自动填充成功。",
  },

  /* ── Dialog ────────────────────────────────────────────── */
  addSiteTitle: {
    ar: "إضافة موقع", en: "Add Site", fr: "Ajouter un site",
    es: "Agregar sitio", hi: "साइट जोड़ें", zh: "添加站点",
  },
  editSiteTitle: {
    ar: "تعديل الموقع", en: "Edit Site", fr: "Modifier le site",
    es: "Editar sitio", hi: "साइट संपादित करें", zh: "编辑站点",
  },
  siteUrlLabel: {
    ar: "الموقع / الاسم المستعار", en: "Site / Alias", fr: "Site / Alias",
    es: "Sitio / Alias", hi: "साइट / उपनाम", zh: "网站 / 别名",
  },
  siteUrlPlaceholder: {
    ar: "example.com أو أي ملاحظة", en: "example.com or any note",
    fr: "example.com ou toute note", es: "example.com o cualquier nota",
    hi: "example.com या कोई नोट", zh: "example.com 或任何备注",
  },
  siteLoginLabel: {
    ar: "اسم المستخدم / البريد", en: "Username / Email",
    fr: "Nom d'utilisateur / Email", es: "Nombre de usuario / Correo",
    hi: "उपयोगकर्ता नाम / ईमेल", zh: "用户名 / 邮箱",
  },
  siteLoginPlaceholder: {
    ar: "user@example.com", en: "user@example.com", fr: "user@example.com",
    es: "user@example.com", hi: "user@example.com", zh: "user@example.com",
  },
  sitePasswordLabel: {
    ar: "كلمة المرور", en: "Password", fr: "Mot de passe",
    es: "Contraseña", hi: "पासवर्ड", zh: "密码",
  },
  sitePasswordPlaceholder: {
    ar: "كلمة المرور", en: "Password", fr: "Mot de passe",
    es: "Contraseña", hi: "पासवर्ड", zh: "密码",
  },
  cancelBtn: {
    ar: "إلغاء", en: "Cancel", fr: "Annuler",
    es: "Cancelar", hi: "रद्द करें", zh: "取消",
  },
  saveBtn: {
    ar: "حفظ", en: "Save", fr: "Enregistrer",
    es: "Guardar", hi: "सहेजें", zh: "保存",
  },
  addBtn: {
    ar: "إضافة موقع", en: "Add entry", fr: "Ajouter une entrée",
    es: "Agregar entrada", hi: "प्रविष्टि जोड़ें", zh: "添加条目",
  },

  /* ── Options / Settings ────────────────────────────────── */
  settingsTitle: {
    ar: "⚙ الإعدادات", en: "⚙ Settings", fr: "⚙ Paramètres",
    es: "⚙ Ajustes", hi: "⚙ सेटिंग्स", zh: "⚙ 设置",
  },
  settingsSubtitle: {
    ar: "تخصيص كلمات الكشف عن الحقول والتصدير والاستيراد.",
    en: "Customize field detection keywords, export, and import.",
    fr: "Personnalisez les mots-clés de détection des champs, l'export et l'import.",
    es: "Personalice las palabras clave de detección de campos, exportación e importación.",
    hi: "फ़ील्ड पहचान कीवर्ड, निर्यात और आयात को अनुकूलित करें।",
    zh: "自定义字段检测关键词、导出和导入。",
  },

  /* ── Language Selector ─────────────────────────────────── */
  languageLabel: {
    ar: "🌐 اللغة", en: "🌐 Language", fr: "🌐 Langue",
    es: "🌐 Idioma", hi: "🌐 भाषा", zh: "🌐 语言",
  },

  /* ── User Keywords Card ────────────────────────────────── */
  userKeywordsTitle: {
    ar: "🔑 كلمات حقل المستخدم", en: "🔑 User Field Keywords",
    fr: "🔑 Mots-clés du champ utilisateur", es: "🔑 Palabras clave del campo de usuario",
    hi: "🔑 उपयोगकर्ता फ़ील्ड कीवर्ड", zh: "🔑 用户字段关键词",
  },
  userKeywordsDesc: {
    ar: "كلمات مفصولة بفواصل لتحديد حقول اسم المستخدم / البريد الإلكتروني.",
    en: "Comma-separated words to identify username/email fields.",
    fr: "Mots séparés par des virgules pour identifier les champs nom d'utilisateur / email.",
    es: "Palabras separadas por comas para identificar campos de nombre de usuario / correo.",
    hi: "उपयोगकर्ता नाम/ईमेल फ़ील्ड पहचानने के लिए अल्पविराम से अलग किए गए शब्द।",
    zh: "用逗号分隔的词语，用于识别用户名/邮箱字段。",
  },
  userKeywordsLabel: {
    ar: "الكلمات", en: "Keywords", fr: "Mots-clés",
    es: "Palabras clave", hi: "कीवर्ड", zh: "关键词",
  },
  userKeywordsPlaceholder: {
    ar: "email, user, username, login, identifier",
    en: "email, user, username, login, identifier",
    fr: "email, user, username, login, identifier",
    es: "email, user, username, login, identifier",
    hi: "email, user, username, login, identifier",
    zh: "email, user, username, login, identifier",
  },

  /* ── Password Keywords Card ────────────────────────────── */
  passwordKeywordsTitle: {
    ar: "🔒 كلمات حقل كلمة المرور", en: "🔒 Password Field Keywords",
    fr: "🔒 Mots-clés du champ mot de passe", es: "🔒 Palabras clave del campo de contraseña",
    hi: "🔒 पासवर्ड फ़ील्ड कीवर्ड", zh: "🔒 密码字段关键词",
  },
  passwordKeywordsDesc: {
    ar: "كلمات مفصولة بفواصل لتحديد حقول كلمة المرور.",
    en: "Comma-separated words to identify password fields.",
    fr: "Mots séparés par des virgules pour identifier les champs de mot de passe.",
    es: "Palabras separadas por comas para identificar campos de contraseña.",
    hi: "पासवर्ड फ़ील्ड पहचानने के लिए अल्पविराम से अलग किए गए शब्द।",
    zh: "用逗号分隔的词语，用于识别密码字段。",
  },
  passwordKeywordsLabel: {
    ar: "الكلمات", en: "Keywords", fr: "Mots-clés",
    es: "Palabras clave", hi: "कीवर्ड", zh: "关键词",
  },
  passwordKeywordsPlaceholder: {
    ar: "password, pwd, passcode, pin",
    en: "password, pwd, passcode, pin",
    fr: "password, pwd, passcode, pin",
    es: "password, pwd, passcode, pin",
    hi: "password, pwd, passcode, pin",
    zh: "password, pwd, passcode, pin",
  },

  /* ── Save Settings ─────────────────────────────────────── */
  saveSettingsBtn: {
    ar: "💾 حفظ الإعدادات", en: "💾 Save Settings", fr: "💾 Enregistrer les paramètres",
    es: "💾 Guardar ajustes", hi: "💾 सेटिंग्स सहेजें", zh: "💾 保存设置",
  },
  saveSuccess: {
    ar: "✅ تم حفظ الإعدادات بنجاح.", en: "✅ Settings saved successfully.",
    fr: "✅ Paramètres enregistrés avec succès.", es: "✅ Ajustes guardados correctamente.",
    hi: "✅ सेटिंग्स सफलतापूर्वक सहेजी गईं।", zh: "✅ 设置已成功保存。",
  },

  /* ── Change Master Key ─────────────────────────────────── */
  changeMasterKeyTitle: {
    ar: "🔐 تغيير المفتاح الرئيسي", en: "🔐 Change Master Key",
    fr: "🔐 Changer le mot de passe principal", es: "🔐 Cambiar la contraseña maestra",
    hi: "🔐 मास्टर पासवर्ड बदलें", zh: "🔐 更改主密码",
  },
  changeMasterKeyDesc: {
    ar: "سيتم فك تشفير جميع بيانات الخزنة وإعادة تشفيرها بالمفتاح الجديد.",
    en: "All vault data will be decrypted and re-encrypted with the new key.",
    fr: "Toutes les données du coffre seront déchiffrées et rechiffrées avec la nouvelle clé.",
    es: "Todos los datos del cofre se descifrarán y volverán a cifrar con la nueva clave.",
    hi: "सभी तिजोरी डेटा डिक्रिप्ट हो जाएगा और नई कुंजी से फिर से एन्क्रिप्ट हो जाएगा।",
    zh: "所有保险库数据将被解密并用新密钥重新加密。",
  },
  currentMasterKeyLabel: {
    ar: "المفتاح الرئيسي الحالي", en: "Current Master Key",
    fr: "Mot de passe principal actuel", es: "Contraseña maestra actual",
    hi: "वर्तमान मास्टर पासवर्ड", zh: "当前主密码",
  },
  newMasterKeyLabel: {
    ar: "المفتاح الرئيسي الجديد", en: "New Master Key",
    fr: "Nouveau mot de passe principal", es: "Nueva contraseña maestra",
    hi: "नया मास्टर पासवर्ड", zh: "新主密码",
  },
  confirmMasterKeyLabel: {
    ar: "تأكيد المفتاح الرئيسي الجديد", en: "Confirm New Master Key",
    fr: "Confirmer le nouveau mot de passe principal", es: "Confirmar la nueva contraseña maestra",
    hi: "नए मास्टर पासवर्ड की पुष्टि करें", zh: "确认新主密码",
  },
  changeMasterKeyBtn: {
    ar: "🔐 تغيير المفتاح", en: "🔐 Change Key",
    fr: "🔐 Changer la clé", es: "🔐 Cambiar clave",
    hi: "🔐 कुंजी बदलें", zh: "🔐 更改密钥",
  },
  masterKeyMismatch: {
    ar: "❌ المفتاحان الجديدان غير متطابقين.", en: "❌ New keys do not match.",
    fr: "❌ Les nouvelles clés ne correspondent pas.", es: "❌ Las nuevas claves no coinciden.",
    hi: "❌ नई कुंजियाँ मेल नहीं खातीं।", zh: "❌ 新密钥不匹配。",
  },
  masterKeyChangeSuccess: {
    ar: "✅ تم تغيير المفتاح الرئيسي بنجاح وإعادة تشفير جميع البيانات.",
    en: "✅ Master key changed successfully. All data has been re-encrypted.",
    fr: "✅ Clé principale modifiée avec succès. Toutes les données ont été rechiffrées.",
    es: "✅ Clave maestra cambiada correctamente. Todos los datos han sido recifrados.",
    hi: "✅ मास्टर कुंजी सफलतापूर्वक बदल दी गई। सभी डेटा फिर से एन्क्रिप्ट हो गया।",
    zh: "✅ 主密钥更改成功。所有数据已重新加密。",
  },
  masterKeyChangeFailed: {
    ar: "❌ فشل تغيير المفتاح الرئيسي. تحقق من المفتاح الحالي.",
    en: "❌ Failed to change master key. Check your current key.",
    fr: "❌ Échec du changement de clé principale. Vérifiez votre clé actuelle.",
    es: "❌ No se pudo cambiar la clave maestra. Verifique su clave actual.",
    hi: "❌ मास्टर कुंजी बदलने में विफल। अपनी वर्तमान कुंजी जांचें।",
    zh: "❌ 更改主密钥失败。请检查您当前的密钥。",
  },
  masterKeySamePassword: {
    ar: "⚠ المفتاح الجديد مطابق للمفتاح الحالي.",
    en: "⚠ New key is the same as the current key.",
    fr: "⚠ La nouvelle clé est identique à la clé actuelle.",
    es: "⚠ La nueva clave es igual a la clave actual.",
    hi: "⚠ नई कुंजी वर्तमान कुंजी के समान है।",
    zh: "⚠ 新密钥与当前密钥相同。",
  },
  currentMasterKeyPlaceholder: {
    ar: "أدخل المفتاح الرئيسي الحالي", en: "Enter current master key",
    fr: "Entrez le mot de passe principal actuel", es: "Ingrese la contraseña maestra actual",
    hi: "वर्तमान मास्टर पासवर्ड दर्ज करें", zh: "输入当前主密码",
  },
  newMasterKeyPlaceholder: {
    ar: "أدخل المفتاح الرئيسي الجديد (4 أحرف على الأقل)", en: "Enter new master key (at least 4 characters)",
    fr: "Entrez le nouveau mot de passe principal (4 caractères minimum)", es: "Ingrese la nueva contraseña maestra (al menos 4 caracteres)",
    hi: "नया मास्टर पासवर्ड दर्ज करें (कम से कम 4 अक्षर)", zh: "输入新主密码（至少4个字符）",
  },
  confirmMasterKeyPlaceholder: {
    ar: "أعد إدخال المفتاح الرئيسي الجديد", en: "Re-enter new master key",
    fr: "Ressaisissez le nouveau mot de passe principal", es: "Vuelva a ingresar la nueva contraseña maestra",
    hi: "नया मास्टर पासवर्ड फिर से दर्ज करें", zh: "重新输入新主密码",
  },

  /* ── Export ────────────────────────────────────────────── */
  exportTitle: {
    ar: "📤 تصدير الخزنة", en: "📤 Export Vault", fr: "📤 Exporter le coffre",
    es: "📤 Exportar cofre", hi: "📤 तिजोरी निर्यात करें", zh: "📤 导出保险库",
  },
  exportDesc: {
    ar: "تصدير جميع بيانات الخزنة (مشفرة) بتنسيق JSON أو CSV.",
    en: "Export all vault data (encrypted) as JSON or CSV.",
    fr: "Exporter toutes les données du coffre (chiffrées) en JSON ou CSV.",
    es: "Exportar todos los datos del cofre (cifrados) como JSON o CSV.",
    hi: "सभी तिजोरी डेटा (एन्क्रिप्टेड) को JSON या CSV के रूप में निर्यात करें।",
    zh: "将所有保险库数据（加密）导出为JSON或CSV格式。",
  },
  exportJsonBtn: {
    ar: "📦 تصدير JSON", en: "📦 Export JSON", fr: "📦 Exporter JSON",
    es: "📦 Exportar JSON", hi: "📦 JSON निर्यात करें", zh: "📦 导出 JSON",
  },
  exportCsvBtn: {
    ar: "📊 تصدير CSV", en: "📊 Export CSV", fr: "📊 Exporter CSV",
    es: "📊 Exportar CSV", hi: "📊 CSV निर्यात करें", zh: "📊 导出 CSV",
  },
  exportNoData: {
    ar: "⚠ لا توجد بيانات للتصدير.", en: "⚠ No data to export.",
    fr: "⚠ Aucune donnée à exporter.", es: "⚠ No hay datos para exportar.",
    hi: "⚠ निर्यात करने के लिए कोई डेटा नहीं।", zh: "⚠ 没有数据可导出。",
  },
  exportSuccess: {
    ar: "✅ تم تصدير {count} مدخلات بنجاح.", en: "✅ Exported {count} entries successfully.",
    fr: "✅ {count} entrées exportées avec succès.", es: "✅ {count} entradas exportadas correctamente.",
    hi: "✅ {count} प्रविष्टियाँ सफलतापूर्वक निर्यात हुईं।",
    zh: "✅ 成功导出 {count} 个条目。",
  },
  exportFailed: {
    ar: "❌ فشل التصدير: {message}", en: "❌ Export failed: {message}",
    fr: "❌ Échec de l'export : {message}", es: "❌ Exportación fallida: {message}",
    hi: "❌ निर्यात विफल: {message}", zh: "❌ 导出失败：{message}",
  },

  /* ── Import ────────────────────────────────────────────── */
  importTitle: {
    ar: "📥 استيراد الخزنة", en: "📥 Import Vault", fr: "📥 Importer le coffre",
    es: "📥 Importar cofre", hi: "📥 तिजोरी आयात करें", zh: "📥 导入保险库",
  },
  importDesc: {
    ar: "استيراد بيانات من ملف JSON أو CSV تم تصديره مسبقاً.",
    en: "Import data from a previously exported JSON or CSV file.",
    fr: "Importer des données depuis un fichier JSON ou CSV exporté précédemment.",
    es: "Importar datos desde un archivo JSON o CSV exportado previamente.",
    hi: "पहले निर्यात की गई JSON या CSV फ़ाइल से डेटा आयात करें।",
    zh: "从之前导出的JSON或CSV文件导入数据。",
  },
  importWarning: {
    ar: "⚠ تنبيه: الاستيراد سيستبدل جميع البيانات الحالية!",
    en: "⚠ Warning: Import will replace all existing data!",
    fr: "⚠ Attention : L'import remplacera toutes les données existantes !",
    es: "⚠ Advertencia: ¡La importación reemplazará todos los datos existentes!",
    hi: "⚠ चेतावनी: आयात सभी मौजूदा डेटा को बदल देगा!",
    zh: "⚠ 警告：导入将替换所有现有数据！",
  },
  importFileLabel: {
    ar: "اختر ملف", en: "Choose file", fr: "Choisir un fichier",
    es: "Seleccionar archivo", hi: "फ़ाइल चुनें", zh: "选择文件",
  },
  importBtn: {
    ar: "📥 استيراد", en: "📥 Import", fr: "📥 Importer",
    es: "📥 Importar", hi: "📥 आयात करें", zh: "📥 导入",
  },
  importNoFile: {
    ar: "⚠ الرجاء اختيار ملف.", en: "⚠ Please select a file.",
    fr: "⚠ Veuillez sélectionner un fichier.", es: "⚠ Por favor seleccione un archivo.",
    hi: "⚠ कृपया एक फ़ाइल चुनें।", zh: "⚠ 请选择文件。",
  },
  importInvalidFormat: {
    ar: "تنسيق ملف غير مدعوم. استخدم JSON أو CSV.",
    en: "Unsupported file format. Use JSON or CSV.",
    fr: "Format de fichier non pris en charge. Utilisez JSON ou CSV.",
    es: "Formato de archivo no compatible. Use JSON o CSV.",
    hi: "असमर्थित फ़ाइल स्वरूप। JSON या CSV का उपयोग करें।",
    zh: "不支持的文件格式。请使用JSON或CSV。",
  },
  importNoValidData: {
    ar: "⚠ الملف لا يحتوي على بيانات صالحة.",
    en: "⚠ The file contains no valid data.",
    fr: "⚠ Le fichier ne contient pas de données valides.",
    es: "⚠ El archivo no contiene datos válidos.",
    hi: "⚠ फ़ाइल में कोई मान्य डेटा नहीं है।",
    zh: "⚠ 文件不包含有效数据。",
  },
  importInvalidEntry: {
    ar: "ملف غير صالح: كل مدخلة تحتاج id و url.",
    en: "Invalid file: each entry needs id and url.",
    fr: "Fichier invalide : chaque entrée nécessite un id et une url.",
    es: "Archivo inválido: cada entrada necesita id y url.",
    hi: "अमान्य फ़ाइल: प्रत्येक प्रविष्टि में id और url होना चाहिए।",
    zh: "无效文件：每个条目都需要id和url。",
  },
  importSuccess: {
    ar: "✅ تم استيراد {count} مدخلات بنجاح.",
    en: "✅ Imported {count} entries successfully.",
    fr: "✅ {count} entrées importées avec succès.",
    es: "✅ {count} entradas importadas correctamente.",
    hi: "✅ {count} प्रविष्टियाँ सफलतापूर्वक आयात हुईं।",
    zh: "✅ 成功导入 {count} 个条目。",
  },
  importFailed: {
    ar: "❌ فشل الاستيراد: {message}", en: "❌ Import failed: {message}",
    fr: "❌ Échec de l'import : {message}", es: "❌ Importación fallida: {message}",
    hi: "❌ आयात विफल: {message}", zh: "❌ 导入失败：{message}",
  },
};

/* ── Current language ────────────────────────────────────── */
let currentLang = "ar";

/**
 * Get the translated string for a given key.
 * Supports simple {placeholder} replacement.
 */
export function t(key, replacements = {}) {
  const translations = TRANSLATIONS[key];
  if (!translations) return key;

  let text = translations[currentLang] || translations["ar"] || key;
  if (typeof text !== "string") return text;

  for (const [placeholder, value] of Object.entries(replacements)) {
    text = text.replace(`{${placeholder}}`, value);
  }

  return text;
}

/**
 * Get the display name of a language code.
 */
export function getLanguageName(langCode) {
  return LANGUAGES[langCode]?.name || langCode;
}

/**
 * Get the text direction for the current language.
 */
export function getDirection() {
  return LANGUAGES[currentLang]?.dir || "ltr";
}

/**
 * Get the current language code.
 */
export function getCurrentLanguage() {
  return currentLang;
}

/**
 * Get all supported language codes.
 */
export function getSupportedLanguages() {
  return Object.keys(LANGUAGES);
}

/**
 * Get the language codes with their display names.
 */
export function getLanguages() {
  return LANGUAGES;
}

/**
 * Set the current language and apply to the document.
 */
export async function setLanguage(langCode) {
  if (!LANGUAGES[langCode]) {
    console.warn(`Language "${langCode}" not supported, falling back to Arabic.`);
    langCode = "ar";
  }
  currentLang = langCode;
  applyToDocument();
}

/**
 * Apply current translations to all elements with data-i18n attributes.
 */
export function applyToDocument() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = getDirection();

  // Translate elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const replacements = {};
    if (el.dataset.i18nReplace) {
      try { Object.assign(replacements, JSON.parse(el.dataset.i18nReplace)); }
      catch { /* ignore */ }
    }
    for (const attr of el.attributes) {
      if (attr.name.startsWith("data-replace-")) {
        replacements[attr.name.replace("data-replace-", "")] = attr.value;
      }
    }
    el.textContent = t(key, replacements);
  });

  // Translate placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  // Translate input values
  document.querySelectorAll("[data-i18n-value]").forEach((el) => {
    el.value = t(el.dataset.i18nValue);
  });

  // Translate title attributes
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
}

/**
 * Initialize the i18n system: load saved preference and apply.
 */
export async function initI18n() {
  const data = await chrome.storage.local.get("app_language");
  const savedLang = data.app_language || "ar";
  if (LANGUAGES[savedLang]) {
    currentLang = savedLang;
  }
  applyToDocument();
  return currentLang;
}

/**
 * Save language preference and re-apply translations.
 */
export async function saveAndApplyLanguage(langCode) {
  if (!LANGUAGES[langCode]) return;
  currentLang = langCode;
  await chrome.storage.local.set({ app_language: langCode });
  applyToDocument();
}
