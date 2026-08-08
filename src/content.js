/* Сканер страницы: прокручивает её до конца и собирает <img>, у которых src — SVG. */
(() => {
  if (window.__svgDownloadrInjected) return;
  window.__svgDownloadrInjected = true;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const report = (payload) => {
    try {
      chrome.runtime.sendMessage({ type: 'SVGD_PROGRESS', ...payload }).catch(() => {});
    } catch {
      /* попап закрыт — прогресс просто некому показать */
    }
  };

  /** Возвращает абсолютный URL, если картинка — SVG, иначе null. */
  function svgUrlOf(img) {
    const raw = img.currentSrc || img.getAttribute('src') || '';
    if (!raw) return null;
    if (/^data:image\/svg\+xml/i.test(raw)) return raw;
    try {
      const url = new URL(raw, location.href);
      if (!/^https?:|^file:/.test(url.protocol)) return null;
      if (/\.svgz?$/i.test(url.pathname)) return url.href;
    } catch {
      /* игнорируем битые src */
    }
    return null;
  }

  function collect(found) {
    for (const img of document.images) {
      const url = svgUrlOf(img);
      if (!url || found.has(url)) continue;
      found.set(url, {
        url,
        alt: img.alt || img.getAttribute('aria-label') || '',
        width: img.naturalWidth || img.width || 0,
        height: img.naturalHeight || img.height || 0
      });
    }
  }

  /**
   * Окно прокручивается не везде: на части сайтов скроллится внутренний контейнер.
   * Если у документа нет своей прокрутки — берём самый крупный скроллящийся элемент.
   */
  function pickScroller() {
    const doc = document.scrollingElement || document.documentElement;
    if (doc.scrollHeight > doc.clientHeight + 50) return null;

    let best = null;
    let bestArea = 0;
    for (const el of document.querySelectorAll('*')) {
      if (el.scrollHeight <= el.clientHeight + 50) continue;
      const style = getComputedStyle(el);
      if (!/(auto|scroll|overlay)/.test(style.overflowY)) continue;
      const rect = el.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (area > bestArea) {
        bestArea = area;
        best = el;
      }
    }
    return best;
  }

  const posOf = (el) => (el ? el.scrollTop : window.scrollY);
  const viewOf = (el) => (el ? el.clientHeight : window.innerHeight);
  const fullOf = (el) => (el ? el.scrollHeight : (document.scrollingElement || document.documentElement).scrollHeight);

  function scrollBy(el, delta) {
    if (el) el.scrollTop += delta;
    else window.scrollBy(0, delta);
  }

  function scrollTo(el, pos) {
    if (el) el.scrollTop = pos;
    else window.scrollTo(0, pos);
  }

  async function scanPage(options) {
    const stepRatio = options.stepRatio ?? 0.8;
    const delay = options.delay ?? 250;
    const maxSteps = options.maxSteps ?? 300;

    const found = new Map();
    const scroller = pickScroller();
    const startPos = posOf(scroller);
    const htmlStyle = document.documentElement.style;
    const prevBehavior = htmlStyle.scrollBehavior;
    htmlStyle.scrollBehavior = 'auto';

    collect(found);
    report({ found: found.size, step: 0 });

    let prevPos = -1;
    let stagnant = 0;
    let steps = 0;

    try {
      while (steps < maxSteps) {
        steps++;
        scrollBy(scroller, Math.max(200, viewOf(scroller) * stepRatio));
        await sleep(delay);
        collect(found);
        report({ found: found.size, step: steps });

        const pos = posOf(scroller);
        if (Math.abs(pos - prevPos) < 2) {
          // Позиция не меняется: либо дно, либо ждём подгрузку контента.
          stagnant++;
          if (stagnant >= 3) break;
          await sleep(delay * 2);
          collect(found);
        } else {
          stagnant = 0;
        }
        prevPos = pos;
      }
    } finally {
      scrollTo(scroller, startPos);
      htmlStyle.scrollBehavior = prevBehavior;
    }

    return {
      ok: true,
      items: [...found.values()],
      steps,
      reachedLimit: steps >= maxSteps,
      pageTitle: document.title,
      pageUrl: location.href
    };
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type !== 'SVGD_SCAN') return;
    scanPage(msg.options || {}).then(sendResponse, (err) =>
      sendResponse({ ok: false, error: String(err?.message || err) })
    );
    return true;
  });
})();
