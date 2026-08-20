const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync(require.resolve('../src/content/content.js'), 'utf8');

function luminance(hex) {
  const channels = hex.match(/[\da-f]{2}/gi)
    .map((channel) => parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first, second) {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

test('theme overrides keep key light and violet control text at WCAG AA contrast', () => {
  assert.ok(contrast('ffffff', '5f50c8') >= 4.5, 'selected controls need white-on-indigo contrast');
  assert.ok(contrast('343952', 'eceef5') >= 4.5, 'light secondary controls need readable text');
  assert.ok(contrast('4c4b61', 'd9d7e8') >= 4.5, 'disabled light primary action needs readable text');
  assert.ok(contrast('ede9ff', '2a2047') >= 4.5, 'violet controls need readable text');
  assert.ok(contrast('9b1c31', 'ffffff') >= 4.5, 'light danger controls need readable text');
  assert.ok(contrast('5d647c', 'ffffff') >= 4.5, 'light muted queue text needs readable contrast');
  assert.ok(contrast('525a74', 'e5e7ef') >= 4.5, 'disabled light secondary action needs readable text');
  assert.ok(contrast('8d263b', 'fff1f3') >= 4.5, 'error notices need readable text on every theme');
});

test('light-theme controls explicitly override the conflicting base colors without changing card layout', () => {
  assert.match(source, /\.qd-theme-light \.qd-segment button\[aria-pressed=true\]\{color:#fff;background:#5f50c8\}/);
  assert.match(source, /\.qd-theme-light \.qd-density button\{color:#343952\}/);
  assert.match(source, /\.qd-theme-light \.qd-primary:disabled\{opacity:1;border:1px solid #b6b1d4;background:#d9d7e8;color:#4c4b61\}/);
  assert.match(source, /\.qd-theme-light \.qd-secondary\{border-color:#9da8bf;background:#eceef5;color:#343952\}/);
  assert.match(source, /\.qd-theme-light \.qd-secondary:disabled\{opacity:1;border-color:#c3c9d8;background:#e5e7ef;color:#525a74\}/);
  assert.match(source, /\.qd-theme-light \.qd-danger\{border-color:#be3450;color:#9b1c31\}/);
  assert.match(source, /\.qd-theme-light \.qd-selection-hint,\.qd-theme-light \.qd-current,\.qd-theme-light \.qd-progress-percent,\.qd-theme-light \.qd-progress h3,\.qd-theme-light \.qd-progress-ring small\{color:#5d647c\}/);
  assert.match(source, /\.qd-items\{display:grid;gap:10px;overflow:auto;padding:0 24px 18px\}/);
});
