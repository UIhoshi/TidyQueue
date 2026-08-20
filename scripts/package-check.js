const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const requiredFiles = ['src/popup/popup.html', 'src/popup/popup.js', 'src/content/content.js', 'src/content/cleanup-session.js', 'src/content/queue-controller.js', 'src/content/queue-safety-guard.js', 'src/content/conversation-adapter.js', 'src/content/gemini-adapter.js', 'src/content/copilot-adapter.js', 'src/content/perplexity-adapter.js', 'src/content/kimi-adapter.js', 'src/content/provider-adapter.js', 'assets/tidyqueue-icon-128.png'];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\\uFEFF/, ''));
const manifest = readJson(path.join(root, 'manifest.json'));
const packageJson = readJson(path.join(root, 'package.json'));
if (!/^\d+\.\d+\.\d+$/.test(manifest.version || '')) throw new Error('manifest version must be a three-part Chrome version');
if (manifest.version !== packageJson.version) throw new Error('manifest and package versions must match');
if (manifest.manifest_version !== 3) throw new Error('manifest_version must be 3');
if (manifest.icons?.['128'] !== 'assets/tidyqueue-icon-128.png') throw new Error('Manifest must register the 128px TidyQueue icon');
if (manifest.action?.default_icon?.['128'] !== manifest.icons['128']) throw new Error('Extension action must use the registered 128px icon');
if (!Array.isArray(manifest.content_scripts) || manifest.content_scripts.length !== 1) throw new Error('Exactly one content script registration is required');
const matches = manifest.content_scripts[0].matches || [];
for (const host of ['https://chatgpt.com/*', 'https://chat.openai.com/*', 'https://gemini.google.com/app*', 'https://copilot.com/*', 'https://copilot.microsoft.com/*', 'https://perplexity.ai/*', 'https://www.perplexity.ai/*', 'https://kimi.com/*', 'https://www.kimi.com/*']) if (!matches.includes(host)) throw new Error(`Missing host match: ${host}`);
if (matches.includes('https://claude.ai/*') || manifest.content_scripts[0].js.includes('src/content/claude-adapter.js')) throw new Error('Claude support must not be registered');
if (manifest.permissions?.includes('debugger')) throw new Error('TidyQueue must not request debugger permission');
for (const file of requiredFiles) if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing required file: ${file}`);
const icon = fs.readFileSync(path.join(root, manifest.icons['128']));
if (icon.subarray(0, 8).compare(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) !== 0 || icon.readUInt32BE(16) !== 128 || icon.readUInt32BE(20) !== 128) {
  throw new Error('TidyQueue icon must be a 128x128 PNG');
}
const locales = ['en', 'zh_CN', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'it'];
const englishMessages = readJson(path.join(root, '_locales', 'en', 'messages.json'));
for (const locale of locales) {
  const file = path.join(root, '_locales', locale, 'messages.json');
  const messages = readJson(file);
  for (const key of Object.keys(englishMessages)) {
    if (!messages[key]?.message) throw new Error(`Locale ${locale} lacks ${key}`);
  }
}
for (const key of ['milestone', 'selectConversation', 'progressLabel']) {
  if (!englishMessages[key].message.includes('$1')) throw new Error(`Locale message ${key} must support its first substitution`);
}
if (!englishMessages.progressLabel.message.includes('$2')) throw new Error('Locale message progressLabel must support its second substitution');
console.log('Package structure is valid.');
