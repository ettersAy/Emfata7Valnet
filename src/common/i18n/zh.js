/**
 * Chinese translations for مفاتيح
 */
export default {
  appName: "钥匙",
  appSubtitle: "安全密码管理器",
  searchPlaceholder: "🔍 搜索…",

  /* ── Vault Gate ────────────────────────────────────────── */
  vaultLocked: "保险库已锁定",
  masterPasswordPlaceholder: "输入主密码…",
  togglePasswordVisibility: "切换密码可见性",
  unlockBtn: "解锁",
  createVaultBtn: "创建保险库",
  vaultHintConfigured: "每天输入一次您的主密码。",
  vaultHintNew: "创建您的主密码以加密保险库。",
  minLengthError: "请至少使用4个字符。",
  invalidMasterPassword: "主密码无效。",
  vaultUnlocked: "保险库已解锁。",
  lockVaultTitle: "锁定保险库",

  /* ── Password Strength ─────────────────────────────────── */
  strengthWeak: "弱 — 增加更多种类",
  strengthFair: "一般",
  strengthGood: "好 — 几乎强",
  strengthStrong: "强 — 优秀！",

  /* ── List / Entries ────────────────────────────────────── */
  entriesCount: "{count} 条目",
  entriesCountFiltered: "{visible} / {total}",
  noEntriesYet: "尚无条目",
  emptyStateMessage: "点击上面的+按钮添加您的第一个密码。",
  expandListBtn: "📋 钥匙 ({count})",

  /* ── Row Actions ────────────────────────────────────────── */
  openSiteTitle: "打开 {url} — 双击复制URL",
  editEntryTitle: "编辑条目",
  deleteEntryTitle: "删除条目",
  dragHandleTitle: "拖拽以重新排序",
  minimizeEntryTitle: "最小化到底部",

  /* ── Credential Pairs ──────────────────────────────────── */
  showPasswordTitle: "显示密码",
  hidePasswordTitle: "隐藏密码",
  fillCredentialsTitle: "填写凭据",
  credentialsListTitle: "凭据",
  addCredentialBtn: "+ 添加凭据",
  addCredentialRowTitle: "为此条目添加凭据",

  /* ── Toast Messages ────────────────────────────────────── */
  deletedSuccess: "已删除。",
  copied: "已复制！",
  copiedUsername: "用户名已复制。",
  copiedPassword: "密码已复制。",
  copiedUrl: "URL已复制。",
  notAValidUrl: "此条目不是有效的网址。",
  encryptedDataMissing: "加密数据丢失。",
  decryptionFailed: "解密失败。",
  hostMismatch: "自动填充失败：主机名不匹配。",
  autofillSuccess: "自动填充成功。",
  savedSuccess: "已保存！",

  /* ── Dialog ────────────────────────────────────────────── */
  addSiteTitle: "添加站点",
  editSiteTitle: "编辑站点",
  siteUrlLabel: "网站 / 别名",
  siteUrlPlaceholder: "example.com 或任何备注",
  siteLoginLabel: "用户名 / 邮箱",
  siteLoginPlaceholder: "user@example.com",
  sitePasswordLabel: "密码",
  sitePasswordPlaceholder: "密码",
  cancelBtn: "取消",
  saveBtn: "保存",
  addBtn: "添加条目",

  /* ── Options / Settings ────────────────────────────────── */
  settingsTitle: "⚙ 设置",
  settingsSubtitle: "自定义字段检测关键词、导出和导入。",

  /* ── Language Selector ─────────────────────────────────── */
  languageLabel: "🌐 语言",

  /* ── User Keywords Card ────────────────────────────────── */
  userKeywordsTitle: "🔑 用户字段关键词",
  userKeywordsDesc: "用逗号分隔的词语，用于识别用户名/邮箱字段。",
  userKeywordsLabel: "关键词",
  userKeywordsPlaceholder: "email, user, username, login, identifier",

  /* ── Password Keywords Card ────────────────────────────── */
  passwordKeywordsTitle: "🔒 密码字段关键词",
  passwordKeywordsDesc: "用逗号分隔的词语，用于识别密码字段。",
  passwordKeywordsLabel: "关键词",
  passwordKeywordsPlaceholder: "password, pwd, passcode, pin",

  /* ── Save Settings ─────────────────────────────────────── */
  saveSettingsBtn: "💾 保存设置",
  saveSuccess: "✅ 设置已成功保存。",

  /* ── Change Master Key ─────────────────────────────────── */
  changeMasterKeyTitle: "🔐 更改主密码",
  changeMasterKeyDesc: "所有保险库数据将被解密并用新密钥重新加密。",
  currentMasterKeyLabel: "当前主密码",
  newMasterKeyLabel: "新主密码",
  confirmMasterKeyLabel: "确认新主密码",
  changeMasterKeyBtn: "🔐 更改密钥",
  masterKeyMismatch: "❌ 新密钥不匹配。",
  masterKeyChangeSuccess: "✅ 主密钥更改成功。所有数据已重新加密。",
  masterKeyChangeFailed: "❌ 更改主密钥失败。请检查您当前的密钥。",
  masterKeySamePassword: "⚠ 新密钥与当前密钥相同。",
  currentMasterKeyPlaceholder: "输入当前主密码",
  newMasterKeyPlaceholder: "输入新主密码（至少4个字符）",
  confirmMasterKeyPlaceholder: "重新输入新主密码",

  /* ── Export ────────────────────────────────────────────── */
  exportTitle: "📤 导出保险库",
  exportDesc: "将所有保险库数据（加密）导出为JSON或CSV格式。",
  exportJsonBtn: "📦 导出 JSON",
  exportCsvBtn: "📊 导出 CSV",
  exportNoData: "⚠ 没有数据可导出。",
  exportSuccess: "✅ 成功导出 {count} 个条目。",
  exportFailed: "❌ 导出失败：{message}",

  /* ── Import ────────────────────────────────────────────── */
  importTitle: "📥 导入保险库",
  importDesc: "从之前导出的JSON或CSV文件导入数据。",
  importWarning: "⚠ 警告：导入将替换所有现有数据！",
  importFileLabel: "选择文件",
  importBtn: "📥 导入",
  importNoFile: "⚠ 请选择文件。",
  importInvalidFormat: "不支持的文件格式。请使用JSON或CSV。",
  importNoValidData: "⚠ 文件不包含有效数据。",
  importInvalidEntry: "无效文件：每个条目都需要id和url。",
  importSuccess: "✅ 成功导入 {count} 个条目。",
  importFailed: "❌ 导入失败：{message}",
};
