const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const requiredFiles = ['src/popup/popup.html', 'src/popup/popup.js', 'src/content/content.js', 'src/content/queue-controller.js', 'src/content/conversation-adapter.js'];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\\uFEFF/, ''));
const manifest = readJson(path.join(root, 'manifest.json'));
if (manifest.manifest_version !== 3) throw new Error('manifest_version must be 3');
if (!Array.isArray(manifest.content_scripts) || manifest.content_scripts.length !== 1) throw new Error('Exactly one content script registration is required');
const matches = manifest.content_scripts[0].matches || [];
for (const host of ['https://chatgpt.com/*', 'https://chat.openai.com/*']) if (!matches.includes(host)) throw new Error(`Missing host match: ${host}`);
for (const file of requiredFiles) if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing required file: ${file}`);
for (const locale of ['en', 'zh_CN', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'it']) {
  const file = path.join(root, '_locales', locale, 'messages.json');
  const messages = readJson(file);
  for (const key of ['extensionName', 'extensionDescription', 'title', 'review', 'confirm', 'pause', 'stop', 'theme', 'themeAuto', 'themeDark', 'themeLight', 'themeViolet', 'pacing', 'readyToDelete', 'deletionQueue']) {
    if (!messages[key]?.message) throw new Error(`Locale ${locale} lacks ${key}`);
  }
}
console.log('Package structure is valid.');