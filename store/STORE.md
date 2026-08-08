# Материалы для Chrome Web Store

Картинки лежат в `store/ru/` и `store/en/` — оба комплекта в PNG-24 без альфа-канала,
размеры уже соответствуют требованиям формы.

| Файл | Размер | Куда |
|---|---|---|
| `screenshot-1-scan.png` | 1280×800 | Скриншоты |
| `screenshot-2-pdf.png` | 1280×800 | Скриншоты |
| `screenshot-3-options.png` | 1280×800 | Скриншоты |
| `screenshot-4-languages.png` | 1280×800 | Скриншоты |
| `promo-small-440x280.png` | 440×280 | Маленькое рекламное изображение |
| `promo-large-1400x560.png` | 1400×560 | Очень большое рекламное изображение |

Скриншоты сняты с настоящего расширения на демо-галерее из 18 SVG-иконок: попап, список
найденного, готовый PDF и разница между форматами страницы — всё реальные кадры, не макеты.

---

## Название

Берётся из манифеста: **SVG Downloadr**

## Краткое описание (поле `description`, до 132 символов)

RU: `Прокручивает страницу, собирает все <img> с SVG и сохраняет найденное одним PDF.`

EN: `Scrolls the page, collects every <img> whose src is an SVG and saves them as a single PDF.`

Уже прописано в `public/_locales/{ru,en}/messages.json` — отдельно вводить не нужно.

## Категория

«Инструменты разработчика» (Developer Tools). Запасной вариант — «Продуктивность».

---

## Описание (RU)

```
SVG Downloadr собирает векторные картинки со страницы и сохраняет их одним PDF-файлом.

КАК ЭТО РАБОТАЕТ

1. Откройте нужную страницу и нажмите на иконку расширения.
2. Нажмите «Сканировать страницу». Расширение само прокрутит её сверху донизу и найдёт
   каждый <img>, у которого src ведёт на SVG. Картинки, которые подгружаются лениво при
   прокрутке, тоже попадут в список. По окончании страница вернётся на исходное место.
3. Просмотрите найденное, снимите галочки с ненужного и нажмите «Скачать PDF».
   Каждая картинка ляжет на отдельную страницу.

ЧТО ВНУТРИ

• Векторный PDF. Картинки переносятся не картинкой, а векторными командами: файл остаётся
  лёгким, а увеличение не размывает линии. 18 иконок укладываются примерно в 12 КБ.
• Формат страницы на выбор: вписать в A4 или страница ровно по размеру SVG.
• Растровый режим на случай, когда важно точное совпадение с тем, что видно в браузере:
  в векторном PDF свои шрифты не встраиваются и заменяются базовыми.
• Автопрокрутка понимает страницы без обычного скролла — расширение находит внутренний
  скролл-контейнер и прокручивает его.
• Результат сканирования сохраняется до конца сессии, поэтому закрытие попапа его не теряет.
• Интерфейс на русском и английском: язык подставляется по языку Chrome, переключатель —
  в углу попапа.
• Ничего не грузится из сети во время работы: все библиотеки собраны внутрь расширения.

ЧЕГО РАСШИРЕНИЕ НЕ ДЕЛАЕТ

• Не отправляет ваши данные никуда: и страницы, и SVG, и готовый PDF остаются в браузере.
• Не собирает аналитику и не показывает рекламу.
• Не подгружает и не выполняет удалённый код.

ОГРАНИЧЕНИЯ, О КОТОРЫХ ЧЕСТНО СТОИТ ЗНАТЬ

• Картинки внутри <iframe> не сканируются — только основной документ страницы.
• В векторном режиме шрифты сводятся к базовым PDF-шрифтам (Helvetica / Times / Courier).
  Нужен точный вид — выберите «Растр».
• SVG, ссылающиеся на внешние картинки или шрифты, рендерятся без них: браузер отдаёт такие
  файлы изолированно.
• Если SVG не удаётся перенести вектором (сложные фильтры и маски), он автоматически
  вставляется растром, а в попапе появляется предупреждение.

ЗАЧЕМ НУЖНЫ РАЗРЕШЕНИЯ

• Доступ к сайтам — чтобы запустить сканирование на открытой вкладке и скачать сами
  SVG-файлы для сборки PDF.
• scripting — чтобы внедрить скрипт сканирования в текущую вкладку по нажатию кнопки.
• storage — чтобы запомнить выбранный язык и результат последнего сканирования.

Расширение с открытым исходным кодом.
```

## Описание (EN)

```
SVG Downloadr collects the vector images from a page and saves them as a single PDF.

HOW IT WORKS

1. Open the page you need and click the extension icon.
2. Press "Scan page". The extension scrolls the page from top to bottom on its own and finds
   every <img> whose src points to an SVG. Images that load lazily while scrolling are picked
   up too. When it is done, the page returns to where you left it.
3. Review the results, uncheck what you don't need and press "Download PDF".
   Every image gets its own page.

WHAT'S INSIDE

• A vector PDF. Images are written as vector drawing commands rather than pixels, so the file
  stays small and zooming never blurs the strokes. 18 icons fit into roughly 12 KB.
• Page format is up to you: fit to A4, or a page exactly the size of the SVG.
• A raster mode for when the result must match the browser exactly — a vector PDF cannot embed
  custom fonts and falls back to the base ones.
• Auto-scroll handles pages without normal window scrolling: the extension locates the inner
  scroll container and scrolls that instead.
• Scan results survive closing the popup — they are kept for the rest of the session.
• Russian and English interface: it follows your Chrome language, and a switch in the popup
  corner overrides it.
• Nothing is fetched from the network at runtime — every library is bundled into the extension.

WHAT IT DOES NOT DO

• It sends nothing anywhere: pages, SVGs and the resulting PDF never leave your browser.
• No analytics, no ads.
• No remote code is downloaded or executed.

HONEST LIMITATIONS

• Images inside <iframe> are not scanned — only the main document.
• In vector mode fonts are mapped to the base PDF fonts (Helvetica / Times / Courier).
  Pick "Raster" when the exact typeface matters.
• SVGs that reference external images or fonts render without them, because the browser loads
  such files in isolation.
• If an SVG cannot be converted to vector (complex filters and masks), it is inserted as a
  raster image and the popup shows a warning.

WHY THE PERMISSIONS

• Site access — to run the scan on the tab you opened and to download the SVG files themselves
  so they can be placed into the PDF.
• scripting — to inject the scanning script into the current tab when you press the button.
• storage — to remember your language choice and the last scan result.

Open source.
```

---

## Раздел «Практики конфиденциальности»

**Единственное назначение (single purpose):**

RU: `Расширение находит на открытой странице изображения в формате SVG и сохраняет выбранные из них в один PDF-файл.`

EN: `The extension finds SVG images on the current page and saves the selected ones into a single PDF file.`

**Обоснование разрешений:**

| Разрешение | Формулировка для формы |
|---|---|
| `activeTab` | Нужен доступ к активной вкладке в момент, когда пользователь нажал кнопку сканирования. |
| `scripting` | Скрипт сканирования внедряется в текущую вкладку по действию пользователя, чтобы прокрутить страницу и собрать адреса SVG-изображений. |
| `storage` | Хранятся только выбранный язык интерфейса и результат последнего сканирования; данные не покидают браузер. |
| Доступ ко всем сайтам (`host_permissions`) | Пользователь может запустить сканирование на любом сайте, поэтому заранее ограничить список доменов нельзя. Разрешение используется для чтения SVG-файлов той страницы, которую пользователь сам открыл и просканировал. |
| Удалённый код | Не используется: все зависимости (Vue, jsPDF, svg2pdf.js) собраны в пакет расширения. |

**Сбор данных:** расширение не собирает и не передаёт никакие пользовательские данные —
в декларации отмечаются все пункты «не собирается».
