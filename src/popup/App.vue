<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import SvgTile from './components/SvgTile.vue';
import { codedError } from '../lib/errors.js';
import { LOCALES, initLocale, locale, setLocale, t, translateError, translateWarning } from '../lib/i18n.js';
import { buildPdf } from '../lib/pdf.js';
import {
  clearCachedScan,
  fetchSvgText,
  getActiveTab,
  isScannable,
  loadCachedScan,
  saveCachedScan,
  scanTab
} from '../lib/scan.js';

const tab = ref(null);
const items = ref([]);
const selected = ref(new Set());
const pageMode = ref('a4');
const renderMode = ref('vector');
const busy = ref(false);
const status = ref(null); // { key, params } — переводится при отрисовке, поэтому переживает смену языка
const error = ref(null);
const warnings = ref([]);
const scanned = ref(false);

const host = computed(() => {
  try {
    return new URL(tab.value?.url || '').hostname || '';
  } catch {
    return '';
  }
});

const canScan = computed(() => isScannable(tab.value?.url));
const allSelected = computed(() => items.value.length > 0 && selected.value.size === items.value.length);
const statusText = computed(() => (status.value ? t(status.value.key, status.value.params) : ''));
const errorText = computed(() => (error.value ? translateError(error.value) : ''));

const setStatus = (key, params) => {
  status.value = { key, params };
};

function fileNameOf(url) {
  if (url.startsWith('data:')) return 'inline.svg';
  try {
    const name = decodeURIComponent(new URL(url).pathname.split('/').pop() || '');
    return name || url.slice(0, 40);
  } catch {
    return url.slice(0, 40);
  }
}

function applyScan(data) {
  items.value = (data.items || []).map((item) => ({ ...item, name: fileNameOf(item.url) }));
  selected.value = new Set(items.value.map((item) => item.url));
  scanned.value = true;

  if (!items.value.length) setStatus('nothingFound');
  else setStatus(data.reachedLimit ? 'foundLimited' : 'found', { n: items.value.length });
}

function onProgress(msg) {
  if (msg?.type === 'SVGD_PROGRESS' && busy.value) setStatus('scrolling', { n: msg.found });
}

onMounted(async () => {
  chrome.runtime.onMessage.addListener(onProgress);
  await initLocale();
  tab.value = await getActiveTab();
  if (!canScan.value) {
    error.value = codedError('unsupported_page');
    return;
  }
  const cached = await loadCachedScan(tab.value.id);
  if (cached && cached.url === tab.value.url) applyScan(cached);
});

onUnmounted(() => chrome.runtime.onMessage.removeListener(onProgress));

async function scan() {
  busy.value = true;
  error.value = null;
  warnings.value = [];
  setStatus('scrolling', { n: 0 });
  try {
    const result = await scanTab(tab.value.id);
    applyScan(result);
    await saveCachedScan(tab.value.id, {
      url: tab.value.url,
      items: result.items,
      reachedLimit: result.reachedLimit
    });
  } catch (err) {
    error.value = err;
    status.value = null;
    await clearCachedScan(tab.value.id);
  } finally {
    busy.value = false;
  }
}

function toggle(url) {
  const next = new Set(selected.value);
  next.has(url) ? next.delete(url) : next.add(url);
  selected.value = next;
}

function toggleAll() {
  selected.value = allSelected.value ? new Set() : new Set(items.value.map((item) => item.url));
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function pdfName() {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
  return `svg-${host.value || 'page'}-${stamp}.pdf`;
}

async function download() {
  busy.value = true;
  error.value = null;
  warnings.value = [];
  const chosen = items.value.filter((item) => selected.value.has(item.url));
  const entries = [];

  try {
    for (let i = 0; i < chosen.length; i++) {
      const item = chosen[i];
      setStatus('loadingSvg', { i: i + 1, n: chosen.length });
      try {
        entries.push({ url: item.url, name: item.name, svgText: await fetchSvgText(item.url) });
      } catch (err) {
        warnings.value.push({ name: item.name, code: err.code || 'unknown', detail: err.detail ?? err.message });
      }
    }

    if (!entries.length) throw codedError('nothing_loaded');

    const result = await buildPdf(entries, {
      pageMode: pageMode.value,
      renderMode: renderMode.value,
      onProgress: ({ index, total, name }) => setStatus('buildingPdf', { i: index + 1, n: total, name })
    });

    warnings.value.push(...result.warnings);
    saveBlob(result.blob, pdfName());
    setStatus('pdfReady', { n: result.pages });
  } catch (err) {
    error.value = err;
    status.value = null;
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <header>
    <h1>{{ t('title') }}</h1>
    <span class="host">{{ host }}</span>
    <div class="langs" :title="t('languageHint')">
      <button
        v-for="code in LOCALES"
        :key="code"
        class="lang"
        :class="{ on: locale === code }"
        @click="setLocale(code)"
      >
        {{ code.toUpperCase() }}
      </button>
    </div>
  </header>

  <section class="bar">
    <button :disabled="busy || !canScan" @click="scan">
      {{ scanned ? t('rescan') : t('scan') }}
    </button>
    <label v-if="items.length" class="all">
      <input type="checkbox" :checked="allSelected" @change="toggleAll" />
      {{ t('selectedOf', { n: selected.size, total: items.length }) }}
    </label>
  </section>

  <p v-if="statusText" class="status">{{ statusText }}</p>
  <p v-if="errorText" class="error">{{ errorText }}</p>

  <div v-if="items.length" class="grid">
    <SvgTile
      v-for="item in items"
      :key="item.url"
      :item="item"
      :selected="selected.has(item.url)"
      @toggle="toggle"
    />
  </div>

  <ul v-if="warnings.length" class="warnings">
    <li v-for="(warning, i) in warnings" :key="i">{{ translateWarning(warning) }}</li>
  </ul>

  <footer>
    <div class="modes">
      <label class="mode">
        {{ t('pageLabel') }}
        <select v-model="pageMode" :disabled="busy">
          <option value="a4">{{ t('pageA4') }}</option>
          <option value="native">{{ t('pageNative') }}</option>
        </select>
      </label>
      <label class="mode" :title="t('renderHint')">
        {{ t('renderLabel') }}
        <select v-model="renderMode" :disabled="busy">
          <option value="vector">{{ t('renderVector') }}</option>
          <option value="raster">{{ t('renderRaster') }}</option>
        </select>
      </label>
    </div>
    <button class="primary wide" :disabled="busy || !selected.size" @click="download">
      {{ t('download', { n: selected.size }) }}
    </button>
  </footer>
</template>

<style scoped>
header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 12px 14px 8px;
}

h1 {
  margin: 0;
  font-size: 15px;
}

.host {
  flex: 1;
  font-size: 11px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.langs {
  display: flex;
  gap: 2px;
}

.lang {
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--muted);
  border-radius: 5px;
}

.lang.on {
  color: var(--accent-fg);
  background: var(--accent);
  border-color: var(--accent);
}

.bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px 10px;
}

.all {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--muted);
  cursor: pointer;
}

.all input {
  accent-color: var(--accent);
  margin: 0;
}

.status,
.error {
  margin: 0;
  padding: 0 14px 10px;
  font-size: 12px;
  color: var(--muted);
}

.error {
  color: var(--danger);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 0 14px 12px;
  max-height: 320px;
  overflow-y: auto;
}

.warnings {
  margin: 0;
  padding: 0 14px 10px 30px;
  max-height: 90px;
  overflow-y: auto;
  font-size: 11px;
  color: var(--danger);
}

footer {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--line);
  background: var(--bg);
}

.modes {
  display: flex;
  gap: 14px;
}

.mode {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--muted);
}

.wide {
  width: 100%;
}
</style>
