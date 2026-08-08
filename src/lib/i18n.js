/* Переводы попапа. Язык берётся из браузера, но его можно переключить вручную. */
import { ref } from 'vue';

export const LOCALES = ['ru', 'en'];

const MESSAGES = {
  ru: {
    title: 'SVG → PDF',
    scan: 'Сканировать страницу',
    rescan: 'Сканировать заново',
    selectedOf: 'Выбрано {n} из {total}',
    scrolling: 'Прокручиваю страницу… найдено: {n}',
    found: 'Найдено SVG: {n}',
    foundLimited: 'Найдено SVG: {n} (достигнут предел прокрутки)',
    nothingFound: 'На странице не нашлось <img> с SVG',
    loadingSvg: 'Загружаю SVG {i} из {n}…',
    buildingPdf: 'Собираю PDF: {i} из {n} ({name})',
    pdfReady: 'PDF готов: страниц — {n}',
    download: 'Скачать PDF ({n})',
    pageLabel: 'Страница:',
    pageA4: 'A4, вписать',
    pageNative: 'По размеру SVG',
    renderLabel: 'Отрисовка:',
    renderVector: 'Вектор',
    renderRaster: 'Растр',
    renderHint:
      'Вектор — картинка масштабируется без потерь, но свои шрифты заменяются на базовые. ' +
      'Растр — точно как в браузере, но фиксированного разрешения.',
    sizeUnknown: 'размер неизвестен',
    languageHint: 'Язык интерфейса',

    err_unsupported_page: 'Эту страницу расширение открыть не может — перейдите на обычный сайт.',
    err_no_page_access: 'Нет доступа к странице ({detail})',
    err_scanner_silent: 'Сканер не ответил',
    err_nothing_loaded: 'Ни один SVG не удалось загрузить',
    err_nothing_rendered: 'Не удалось отрисовать ни одного SVG',
    err_not_svg: 'Ответ не похож на SVG',
    err_http: 'Ошибка загрузки: HTTP {detail}',
    err_svg_parse_failed: 'Не удалось разобрать SVG',
    err_svg_render_failed: 'Браузер не смог отрисовать этот SVG',
    err_unknown: 'Ошибка: {detail}',

    warn_line: '{name}: {text}',
    warn_raster_fallback: 'вставлен растром ({detail})',
    warn_draw_failed: 'не удалось отрисовать ({detail})'
  },
  en: {
    title: 'SVG → PDF',
    scan: 'Scan page',
    rescan: 'Scan again',
    selectedOf: 'Selected {n} of {total}',
    scrolling: 'Scrolling the page… found: {n}',
    found: 'SVGs found: {n}',
    foundLimited: 'SVGs found: {n} (scroll limit reached)',
    nothingFound: 'No <img> with SVG on this page',
    loadingSvg: 'Loading SVG {i} of {n}…',
    buildingPdf: 'Building PDF: {i} of {n} ({name})',
    pdfReady: 'PDF ready: {n} page(s)',
    download: 'Download PDF ({n})',
    pageLabel: 'Page:',
    pageA4: 'A4, fit',
    pageNative: 'SVG size',
    renderLabel: 'Rendering:',
    renderVector: 'Vector',
    renderRaster: 'Raster',
    renderHint:
      'Vector scales without quality loss, but custom fonts are replaced with base PDF ones. ' +
      'Raster matches the browser exactly, at a fixed resolution.',
    sizeUnknown: 'size unknown',
    languageHint: 'Interface language',

    err_unsupported_page: 'The extension cannot open this page — switch to a regular website.',
    err_no_page_access: 'No access to the page ({detail})',
    err_scanner_silent: 'The scanner did not respond',
    err_nothing_loaded: 'None of the SVGs could be loaded',
    err_nothing_rendered: 'None of the SVGs could be rendered',
    err_not_svg: 'The response does not look like SVG',
    err_http: 'Download failed: HTTP {detail}',
    err_svg_parse_failed: 'Could not parse the SVG',
    err_svg_render_failed: 'The browser could not render this SVG',
    err_unknown: 'Error: {detail}',

    warn_line: '{name}: {text}',
    warn_raster_fallback: 'inserted as raster ({detail})',
    warn_draw_failed: 'could not be rendered ({detail})'
  }
};

function detectLocale() {
  const ui = chrome.i18n?.getUILanguage?.() || navigator.language || 'en';
  return ui.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

// Язык браузера известен сразу — так первый кадр попапа уже на нужном языке,
// а сохранённый вручную выбор подхватывается следом.
export const locale = ref(detectLocale());

export async function initLocale() {
  document.documentElement.lang = locale.value;
  const stored = await chrome.storage.local.get('locale');
  if (LOCALES.includes(stored.locale)) {
    locale.value = stored.locale;
    document.documentElement.lang = stored.locale;
  }
}

export async function setLocale(value) {
  if (!LOCALES.includes(value)) return;
  locale.value = value;
  document.documentElement.lang = value;
  await chrome.storage.local.set({ locale: value });
}

export function t(key, params = {}) {
  const template = MESSAGES[locale.value]?.[key] ?? MESSAGES.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => (name in params ? String(params[name]) : `{${name}}`));
}

/** Ошибки из lib/* несут код — переводим по нему, а незнакомые показываем как есть. */
export function translateError(error) {
  const code = error?.code;
  if (code && (MESSAGES[locale.value]?.[`err_${code}`] || MESSAGES.en[`err_${code}`])) {
    return t(`err_${code}`, { detail: error.detail ?? '' });
  }
  return t('err_unknown', { detail: error?.message || error });
}

export function translateWarning(warning) {
  const text = MESSAGES[locale.value]?.[`warn_${warning.code}`]
    ? t(`warn_${warning.code}`, { detail: warning.detail ?? '' })
    : translateError(warning);
  return t('warn_line', { name: warning.name, text });
}
