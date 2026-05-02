/**
 * Arabic translations for مفاتيح
 */
export default {
  appName: "مفاتيح",
  appSubtitle: "مدير كلمات المرور الآمن",
  searchPlaceholder: "🔍 بحث…",

  /* ── Vault Gate ────────────────────────────────────────── */
  vaultLocked: "الخزنة مقفلة",
  masterPasswordPlaceholder: "أدخل المفتاح الرئيسي…",
  togglePasswordVisibility: "إظهار كلمة المرور",
  unlockBtn: "فتح",
  createVaultBtn: "إنشاء الخزنة",
  vaultHintConfigured: "أدخل المفتاح الرئيسي مرة واحدة يومياً.",
  vaultHintNew: "أنشئ مفتاحك الرئيسي لتشفير الخزنة.",
  minLengthError: "استخدم 4 أحرف على الأقل.",
  invalidMasterPassword: "مفتاح رئيسي غير صالح.",
  vaultUnlocked: "تم فتح الخزنة.",
  lockVaultTitle: "قفل الخزنة",

  /* ── Password Strength ─────────────────────────────────── */
  strengthWeak: "ضعيف — أضف تنوعاً أكثر",
  strengthFair: "مقبول",
  strengthGood: "جيد — يكاد يكون قوياً",
  strengthStrong: "قوي — ممتاز!",

  /* ── List / Entries ────────────────────────────────────── */
  entriesCount: "{count} مدخلات",
  entriesCountFiltered: "{visible} / {total}",
  noEntriesYet: "لا توجد مفاتيح بعد",
  emptyStateMessage: "انقر على زر + أعلاه لإضافة أول كلمة مرور.",
  expandListBtn: "📋 المفاتيح ({count})",

  /* ── Row Actions ────────────────────────────────────────── */
  openSiteTitle: "فتح {url} — انقر مرتين لنسخ الرابط",
  editEntryTitle: "تعديل الإدخال",
  deleteEntryTitle: "حذف الإدخال",
  dragHandleTitle: "اسحب لإعادة الترتيب",
  minimizeEntryTitle: "تصغير إلى الأسفل",

  /* ── Credential Pairs ──────────────────────────────────── */
  showPasswordTitle: "إظهار كلمة المرور",
  hidePasswordTitle: "إخفاء كلمة المرور",
  fillCredentialsTitle: "ملء بيانات الدخول",
  credentialsListTitle: "بيانات الدخول",
  addCredentialBtn: "+ إضافة بيانات دخول",
  addCredentialRowTitle: "إضافة بيانات دخول لهذا الإدخال",

  /* ── Toast Messages ────────────────────────────────────── */
  deletedSuccess: "تم الحذف.",
  copied: "تم النسخ!",
  copiedUsername: "تم نسخ اسم المستخدم.",
  copiedPassword: "تم نسخ كلمة المرور.",
  copiedUrl: "تم نسخ الرابط.",
  notAValidUrl: "هذا الإدخال ليس عنوان ويب صالح.",
  encryptedDataMissing: "بيانات مشفرة مفقودة.",
  decryptionFailed: "فشل فك التشفير.",
  hostMismatch: "تعذر الملء التلقائي: اسم المضيف غير متطابق.",
  autofillSuccess: "تم ملء البيانات تلقائياً.",
  savedSuccess: "تم الحفظ!",

  /* ── Dialog ────────────────────────────────────────────── */
  addSiteTitle: "إضافة موقع",
  editSiteTitle: "تعديل الموقع",
  siteUrlLabel: "الموقع / الاسم المستعار",
  siteUrlPlaceholder: "example.com أو أي ملاحظة",
  siteLoginLabel: "اسم المستخدم / البريد",
  siteLoginPlaceholder: "user@example.com",
  sitePasswordLabel: "كلمة المرور",
  sitePasswordPlaceholder: "كلمة المرور",
  cancelBtn: "إلغاء",
  saveBtn: "حفظ",
  addBtn: "إضافة موقع",

  /* ── Options / Settings ────────────────────────────────── */
  settingsTitle: "⚙ الإعدادات",
  settingsSubtitle: "تخصيص كلمات الكشف عن الحقول والتصدير والاستيراد.",

  /* ── Language Selector ─────────────────────────────────── */
  languageLabel: "🌐 اللغة",

  /* ── User Keywords Card ────────────────────────────────── */
  userKeywordsTitle: "🔑 كلمات حقل المستخدم",
  userKeywordsDesc: "كلمات مفصولة بفواصل لتحديد حقول اسم المستخدم / البريد الإلكتروني.",
  userKeywordsLabel: "الكلمات",
  userKeywordsPlaceholder: "email, user, username, login, identifier",

  /* ── Password Keywords Card ────────────────────────────── */
  passwordKeywordsTitle: "🔒 كلمات حقل كلمة المرور",
  passwordKeywordsDesc: "كلمات مفصولة بفواصل لتحديد حقول كلمة المرور.",
  passwordKeywordsLabel: "الكلمات",
  passwordKeywordsPlaceholder: "password, pwd, passcode, pin",

  /* ── Save Settings ─────────────────────────────────────── */
  saveSettingsBtn: "💾 حفظ الإعدادات",
  saveSuccess: "✅ تم حفظ الإعدادات بنجاح.",

  /* ── Change Master Key ─────────────────────────────────── */
  changeMasterKeyTitle: "🔐 تغيير المفتاح الرئيسي",
  changeMasterKeyDesc: "سيتم فك تشفير جميع بيانات الخزنة وإعادة تشفيرها بالمفتاح الجديد.",
  currentMasterKeyLabel: "المفتاح الرئيسي الحالي",
  newMasterKeyLabel: "المفتاح الرئيسي الجديد",
  confirmMasterKeyLabel: "تأكيد المفتاح الرئيسي الجديد",
  changeMasterKeyBtn: "🔐 تغيير المفتاح",
  masterKeyMismatch: "❌ المفتاحان الجديدان غير متطابقين.",
  masterKeyChangeSuccess: "✅ تم تغيير المفتاح الرئيسي بنجاح وإعادة تشفير جميع البيانات.",
  masterKeyChangeFailed: "❌ فشل تغيير المفتاح الرئيسي. تحقق من المفتاح الحالي.",
  masterKeySamePassword: "⚠ المفتاح الجديد مطابق للمفتاح الحالي.",
  currentMasterKeyPlaceholder: "أدخل المفتاح الرئيسي الحالي",
  newMasterKeyPlaceholder: "أدخل المفتاح الرئيسي الجديد (4 أحرف على الأقل)",
  confirmMasterKeyPlaceholder: "أعد إدخال المفتاح الرئيسي الجديد",

  /* ── Export ────────────────────────────────────────────── */
  exportTitle: "📤 تصدير الخزنة",
  exportDesc: "تصدير جميع بيانات الخزنة (مشفرة) بتنسيق JSON أو CSV.",
  exportJsonBtn: "📦 تصدير JSON",
  exportCsvBtn: "📊 تصدير CSV",
  exportNoData: "⚠ لا توجد بيانات للتصدير.",
  exportSuccess: "✅ تم تصدير {count} مدخلات بنجاح.",
  exportFailed: "❌ فشل التصدير: {message}",

  /* ── Import ────────────────────────────────────────────── */
  importTitle: "📥 استيراد الخزنة",
  importDesc: "استيراد بيانات من ملف JSON أو CSV تم تصديره مسبقاً.",
  importWarning: "⚠ تنبيه: الاستيراد سيستبدل جميع البيانات الحالية!",
  importFileLabel: "اختر ملف",
  importBtn: "📥 استيراد",
  importNoFile: "⚠ الرجاء اختيار ملف.",
  importInvalidFormat: "تنسيق ملف غير مدعوم. استخدم JSON أو CSV.",
  importNoValidData: "⚠ الملف لا يحتوي على بيانات صالحة.",
  importInvalidEntry: "ملف غير صالح: كل مدخلة تحتاج id و url.",
  importSuccess: "✅ تم استيراد {count} مدخلات بنجاح.",
  importFailed: "❌ فشل الاستيراد: {message}",
};
