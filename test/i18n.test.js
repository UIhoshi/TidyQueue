const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const localesDir = path.join(root, '_locales');
const english = JSON.parse(fs.readFileSync(path.join(localesDir, 'en', 'messages.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

test('all nine browser locales provide every UI message and dynamic placeholder', () => {
  assert.equal(manifest.default_locale, 'en', 'English must remain the Chrome i18n default');
  const locales = fs.readdirSync(localesDir).filter((entry) => fs.statSync(path.join(localesDir, entry)).isDirectory()).sort();
  assert.deepEqual(locales, ['de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'zh_CN']);
  for (const locale of locales) {
    const catalog = JSON.parse(fs.readFileSync(path.join(localesDir, locale, 'messages.json'), 'utf8'));
    assert.deepEqual(Object.keys(catalog).sort(), Object.keys(english).sort(), `${locale} must match the English message catalog`);
    for (const key of Object.keys(english)) assert.ok(catalog[key].message, `${locale} lacks ${key}`);
    for (const key of ['milestone', 'selectConversation', 'progressLabel']) assert.match(catalog[key].message, /\$1/, `${locale} ${key} must keep $1`);
    assert.match(catalog.progressLabel.message, /\$2/, `${locale} progressLabel must keep $2`);
  }
});

test('content and popup use localized labels without changing their layout source', () => {
  const content = fs.readFileSync(path.join(root, 'src', 'content', 'content.js'), 'utf8');
  const popup = fs.readFileSync(path.join(root, 'src', 'popup', 'popup.html'), 'utf8');
  for (const key of ['openControlCenter', 'localOnly', 'viewMode', 'listDensity', 'ageFilter', 'selectConversation', 'progressLabel']) {
    assert.match(content, new RegExp(`t\\('${key}'`));
  }
  for (const key of ['popupHeading', 'popupStatus', 'popupOpen']) assert.match(popup, new RegExp(`data-i18n="${key}"`));
});

test('content-script English fallback replaces Chrome-style and legacy substitutions', () => {
  const context = { globalThis: {} };
  context.globalThis.globalThis = context.globalThis;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'src', 'content', 'i18n.js'), 'utf8'), context);
  const { t } = context.globalThis.quickdelI18n;
  assert.equal(t('selectConversation', ['Example']), 'Select Example');
  assert.equal(t('progressLabel', ['2', '5']), '2 of 5 conversations completed');
  assert.equal(t('milestone', ['10']), 'Brief pacing pause after 10');
});
