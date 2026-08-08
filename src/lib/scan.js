/* Обвязка над chrome.* : запуск сканера на вкладке, загрузка SVG, кэш последнего результата. */
import { codedError } from './errors.js';

const SCAN_OPTIONS = { stepRatio: 0.8, delay: 250, maxSteps: 300 };

export function isScannable(url) {
  return /^(https?|file):/i.test(url || '');
}

export async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

export async function scanTab(tabId) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
  } catch (err) {
    throw codedError('no_page_access', err.message);
  }

  const result = await chrome.tabs.sendMessage(tabId, { type: 'SVGD_SCAN', options: SCAN_OPTIONS });
  if (!result?.ok) throw codedError('scanner_silent', result?.error);
  return result;
}

/** Popup имеет host_permissions, поэтому качает SVG напрямую — CORS ему не мешает. */
export async function fetchSvgText(url) {
  const res = await fetch(url, { credentials: 'include', cache: 'force-cache' });
  if (!res.ok) throw codedError('http', res.status);
  const text = await res.text();
  if (!/<svg[\s>]/i.test(text)) throw codedError('not_svg');
  return text;
}

const cacheKey = (tabId) => `scan:${tabId}`;

export async function loadCachedScan(tabId) {
  const key = cacheKey(tabId);
  const stored = await chrome.storage.session.get(key);
  return stored[key] || null;
}

export async function saveCachedScan(tabId, data) {
  await chrome.storage.session.set({ [cacheKey(tabId)]: data });
}

export async function clearCachedScan(tabId) {
  await chrome.storage.session.remove(cacheKey(tabId));
}
