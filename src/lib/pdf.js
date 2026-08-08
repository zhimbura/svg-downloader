/* Сборка PDF из найденных SVG: вектор через svg2pdf, растр — только как запасной вариант. */
import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import { codedError } from './errors.js';
import { normalizeFonts, parseSvg, rasterizeToPng } from './svg.js';

const PT_PER_PX = 72 / 96;
const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 24;
const RASTER_SCALE = 3;
const MAX_RASTER_DIM = 4000;

/** Размер страницы и место картинки на ней (в пунктах). */
function layoutFor(pageMode, pxWidth, pxHeight) {
  const width = Math.max(1, pxWidth * PT_PER_PX);
  const height = Math.max(1, pxHeight * PT_PER_PX);

  if (pageMode === 'native') {
    return { pageWidth: width, pageHeight: height, x: 0, y: 0, width, height };
  }

  const landscape = width > height;
  const pageWidth = landscape ? A4.height : A4.width;
  const pageHeight = landscape ? A4.width : A4.height;
  const scale = Math.min((pageWidth - MARGIN * 2) / width, (pageHeight - MARGIN * 2) / height);
  const drawWidth = width * scale;
  const drawHeight = height * scale;

  return {
    pageWidth,
    pageHeight,
    x: (pageWidth - drawWidth) / 2,
    y: (pageHeight - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight
  };
}

/** svg2pdf читает вычисленные стили, поэтому элемент должен реально жить в документе. */
function createHost() {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:fixed;left:-100000px;top:0;opacity:0;pointer-events:none;';
  document.body.appendChild(host);
  return host;
}

async function drawRaster(doc, svgText, layout) {
  const ratio = Math.min(
    RASTER_SCALE,
    MAX_RASTER_DIM / Math.max(layout.width / PT_PER_PX, layout.height / PT_PER_PX)
  );
  const scale = Math.max(1, ratio);
  const dataUrl = await rasterizeToPng(
    svgText,
    (layout.width / PT_PER_PX) * scale,
    (layout.height / PT_PER_PX) * scale
  );
  doc.addImage(dataUrl, 'PNG', layout.x, layout.y, layout.width, layout.height, undefined, 'FAST');
}

/**
 * @param {Array<{url: string, name: string, svgText: string}>} entries
 * @param {{pageMode?: 'a4'|'native', renderMode?: 'vector'|'raster', onProgress?: (info: object) => void}} options
 * @returns {Promise<{blob: Blob, pages: number, warnings: Array<{name: string, code: string, detail: string}>}>}
 */
export async function buildPdf(entries, { pageMode = 'a4', renderMode = 'vector', onProgress } = {}) {
  const host = createHost();
  const warnings = [];
  let doc = null;
  let pages = 0;

  try {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      onProgress?.({ index: i, total: entries.length, name: entry.name });

      let parsed;
      try {
        parsed = parseSvg(entry.svgText);
      } catch (err) {
        warnings.push({ name: entry.name, code: err.code || 'unknown', detail: err.detail || err.message });
        continue;
      }

      const layout = layoutFor(pageMode, parsed.width, parsed.height);
      const format = [layout.pageWidth, layout.pageHeight];
      const orientation = layout.pageWidth > layout.pageHeight ? 'landscape' : 'portrait';

      if (!doc) {
        doc = new jsPDF({ unit: 'pt', format, orientation, compress: true });
      } else {
        doc.addPage(format, orientation);
      }
      pages++;

      if (renderMode === 'raster') {
        try {
          await drawRaster(doc, entry.svgText, layout);
        } catch (err) {
          warnings.push({ name: entry.name, code: 'draw_failed', detail: err.code || err.message });
        }
        continue;
      }

      normalizeFonts(parsed.element);
      host.appendChild(parsed.element);
      try {
        await svg2pdf(parsed.element, doc, {
          x: layout.x,
          y: layout.y,
          width: layout.width,
          height: layout.height
        });
      } catch (err) {
        // Часть SVG (фильтры, сложные маски) вектором не переносится — кладём растр.
        try {
          await drawRaster(doc, entry.svgText, layout);
          warnings.push({ name: entry.name, code: 'raster_fallback', detail: err.message });
        } catch (rasterErr) {
          warnings.push({ name: entry.name, code: 'draw_failed', detail: rasterErr.code || rasterErr.message });
        }
      } finally {
        parsed.element.remove();
      }
    }

    if (!doc) throw codedError('nothing_rendered');

    doc.setProperties({ title: 'SVG Downloadr', creator: 'SVG Downloadr' });
    return { blob: doc.output('blob'), pages, warnings };
  } finally {
    host.remove();
  }
}
