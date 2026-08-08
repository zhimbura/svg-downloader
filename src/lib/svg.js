/* Разбор SVG: собственный размер картинки и подготовка элемента для векторной вставки в PDF. */
import { codedError } from './errors.js';

const DEFAULT_SIZE = { width: 300, height: 150 };
const PX_PER_UNIT = { px: 1, pt: 96 / 72, pc: 16, mm: 96 / 25.4, cm: 96 / 2.54, in: 96 };

function parseLength(value) {
  if (!value) return 0;
  const m = String(value).trim().match(/^([\d.]+)\s*(px|pt|pc|mm|cm|in)?$/i);
  if (!m) return 0; // проценты и em игнорируем — размер возьмём из viewBox
  const n = parseFloat(m[1]);
  if (!isFinite(n) || n <= 0) return 0;
  return n * PX_PER_UNIT[(m[2] || 'px').toLowerCase()];
}

/**
 * Разбирает SVG, вычисляет его собственный размер в CSS-пикселях и проставляет
 * явные width/height — без них Chrome и svg2pdf трактуют размер по-разному.
 * Возвращает элемент, уже принадлежащий текущему документу.
 */
export function parseSvg(text) {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  if (doc.querySelector('parsererror') || doc.documentElement.tagName.toLowerCase() !== 'svg') {
    throw codedError('svg_parse_failed');
  }

  const element = document.importNode(doc.documentElement, true);

  let width = parseLength(element.getAttribute('width'));
  let height = parseLength(element.getAttribute('height'));

  const box = (element.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
  const hasBox = box.length === 4 && box.every(isFinite) && box[2] > 0 && box[3] > 0;

  if (hasBox) {
    if (!width && !height) {
      width = box[2];
      height = box[3];
    } else if (!width) {
      width = (height * box[2]) / box[3];
    } else if (!height) {
      height = (width * box[3]) / box[2];
    }
  } else {
    width = width || DEFAULT_SIZE.width;
    height = height || DEFAULT_SIZE.height;
    element.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  element.setAttribute('width', String(width));
  element.setAttribute('height', String(height));

  return { element, width, height };
}

/*
 * В PDF векторный текст рисуется одним из 14 базовых шрифтов, свои шрифты не встраиваются.
 * svg2pdf знает только часть имён (Helvetica, например, у него не резолвится и молча
 * превращается в Times), поэтому заранее сводим font-family к базовому семейству.
 */
const FONT_MAP = {
  helvetica: 'helvetica',
  'helvetica neue': 'helvetica',
  arial: 'helvetica',
  'arial black': 'helvetica',
  verdana: 'helvetica',
  tahoma: 'helvetica',
  'segoe ui': 'helvetica',
  roboto: 'helvetica',
  inter: 'helvetica',
  'system-ui': 'helvetica',
  '-apple-system': 'helvetica',
  'sans-serif': 'helvetica',
  times: 'times',
  'times new roman': 'times',
  georgia: 'times',
  garamond: 'times',
  serif: 'times',
  courier: 'courier',
  'courier new': 'courier',
  menlo: 'courier',
  consolas: 'courier',
  monospace: 'courier'
};

function mapFontFamily(value) {
  const families = String(value)
    .split(',')
    .map((f) => f.trim().replace(/^["']|["']$/g, '').toLowerCase())
    .filter(Boolean);
  for (const family of families) {
    if (FONT_MAP[family]) return FONT_MAP[family];
  }
  return 'helvetica';
}

/** Заменяет font-family в атрибутах, инлайновых стилях и <style> внутри SVG. */
export function normalizeFonts(element) {
  for (const el of [element, ...element.querySelectorAll('*')]) {
    const attr = el.getAttribute?.('font-family');
    if (attr) el.setAttribute('font-family', mapFontFamily(attr));

    const inline = el.getAttribute?.('style');
    if (inline && /font-family/i.test(inline)) {
      el.setAttribute(
        'style',
        inline.replace(/font-family\s*:\s*([^;]+)/gi, (_, value) => `font-family: ${mapFontFamily(value)}`)
      );
    }
  }

  for (const style of element.querySelectorAll('style')) {
    style.textContent = style.textContent.replace(
      /font-family\s*:\s*([^;}]+)/gi,
      (_, value) => `font-family: ${mapFontFamily(value)}`
    );
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(codedError('svg_render_failed'));
    img.src = src;
  });
}

/**
 * Запасной путь: если векторная конвертация не справилась, кладём в PDF растр.
 * SVG рисуем из blob-URL, поэтому canvas не помечается как tainted.
 */
export async function rasterizeToPng(svgText, pixelWidth, pixelHeight) {
  const width = Math.max(1, Math.round(pixelWidth));
  const height = Math.max(1, Math.round(pixelHeight));
  const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }));

  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}
