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

## Ссылки для формы

| Поле | Значение |
|---|---|
| Политика конфиденциальности (обязательно) | `https://github.com/zhimbura/svg-downloader/blob/main/PRIVACY.md` |
| Условия использования | `https://github.com/zhimbura/svg-downloader/blob/main/TERMS.md` |
| Домашняя страница | `https://github.com/zhimbura/svg-downloader` |
| Поддержка | `https://github.com/zhimbura/svg-downloader/issues` |

## Раздел «Конфиденциальность» в консоли разработчика

Тексты ниже готовы к вставке: каждый укладывается в лимит поля (1000 символов).

### Единственное назначение → «Описание цели»

```
SVG Downloadr решает одну задачу: находит на веб-странице, открытой пользователем, изображения в формате SVG, вставленные тегом <img>, и сохраняет выбранные пользователем изображения в один PDF-файл.

Полный сценарий работы: пользователь нажимает на иконку расширения и кнопку «Сканировать страницу» → расширение прокручивает активную вкладку сверху донизу и собирает адреса SVG-изображений, включая те, что подгружаются лениво при прокрутке → пользователь снимает отметки с ненужных → расширение загружает отмеченные файлы и собирает из них PDF, который сохраняется на устройство пользователя.

Других функций у расширения нет. Оно не изменяет содержимое страниц, не работает в фоне, не показывает рекламу, не собирает аналитику, не передаёт данные на серверы и не загружает удалённый код: все библиотеки включены в пакет расширения.
```

### Обоснование (activeTab)

```
activeTab нужен, чтобы обратиться к вкладке, на которой пользователь явно запустил сканирование, нажав кнопку в попапе расширения.

По этому нажатию расширение получает адрес активной вкладки — чтобы проверить, что страница вообще поддерживается (http/https/file), и подставить имя сайта в название готового PDF-файла, — а затем внедряет в эту вкладку скрипт сканирования.

Без activeTab невозможно определить, к какой вкладке относится нажатие кнопки, и запустить на ней поиск SVG-изображений.

Доступ ограничен вкладкой, которую пользователь открыл сам, и возникает только в ответ на его действие. В фоне расширение вкладки не читает и никаких данных о них не сохраняет и не передаёт.
```

### Обоснование (scripting)

```
scripting используется для внедрения скрипта сканирования (content.js) в активную вкладку через chrome.scripting.executeScript — только после того, как пользователь нажал кнопку «Сканировать страницу».

Скрипт выполняет одну задачу: прокручивает страницу сверху донизу, чтобы подгрузились ленивые изображения, собирает адреса элементов <img>, у которых src ведёт на SVG, возвращает этот список в попап и возвращает прокрутку на исходную позицию.

Скрипт не изменяет содержимое страницы, не внедряет в неё разметку и не выполняет удалённый код — он входит в пакет расширения и собран вместе с ним.

Постоянно зарегистрированных content scripts у расширения нет: внедрение происходит только по действию пользователя и только в одну вкладку.
```

### Обоснование (storage)

```
storage хранит на устройстве пользователя две вещи, обе — только для удобства работы:

1. Выбранный язык интерфейса (значение «ru» или «en») в chrome.storage.local, чтобы выбор сохранялся между запусками попапа.

2. Результат последнего сканирования — список адресов найденных SVG-изображений для текущей вкладки — в chrome.storage.session, чтобы список не пропадал, когда попап закрывается (а он закрывается при каждом клике вне окна). Эти данные автоматически удаляются при закрытии браузера.

Персональные данные не сохраняются. Синхронизация (chrome.storage.sync) не используется, данные не покидают устройство и никуда не передаются.
```

### Обоснование доступа к хостам (`<all_urls>`)

```
Расширение работает с той страницей, которую пользователь открыл сам, и заранее список сайтов неизвестен: SVG-иконки, логотипы и иллюстрации встречаются на любых сайтах, поэтому ограничить разрешение конкретными доменами невозможно.

Доступ используется для двух операций и только после нажатия кнопки «Сканировать страницу»:
1. Внедрить скрипт сканирования в активную вкладку, чтобы найти на ней <img> с SVG.
2. Загрузить по HTTP(S) сами SVG-файлы по найденным на этой странице адресам — их содержимое нужно, чтобы собрать из них PDF.

Сетевые запросы идут только к тому сайту, который пользователь просканировал. Расширение не работает в фоне, не читает другие вкладки, не собирает историю и не передаёт содержимое страниц третьим лицам.
```

### Использование удалённого кода

Вариант: **«Нет, я не использую удалённый код»**.

```
Все зависимости (Vue, jsPDF, svg2pdf.js) собраны в пакет расширения сборщиком Vite. Расширение не загружает и не выполняет код из сети, не использует eval и внешние CDN.
```

### Декларация сбора данных

Расширение не собирает ни одну из перечисляемых категорий — все пункты остаются
неотмеченными. Три обязательные галочки-подтверждения внизу («не продаю данные третьим
лицам», «использую данные только для заявленной цели», «не использую данные для оценки
кредитоспособности и кредитования») — отмечаются.

### Ссылка на политику конфиденциальности

`https://github.com/zhimbura/svg-downloader/blob/main/PRIVACY.md`

---

## Английские версии (для локализованной витрины)

**Single purpose:** `SVG Downloadr does one thing: it finds SVG images embedded via <img> on the page the user opened, and saves the ones the user selects into a single PDF file. The user presses the extension icon and "Scan page"; the extension scrolls the active tab from top to bottom, collects the SVG URLs including lazy-loaded ones, and builds a PDF from the selected files. It does not modify pages, run in the background, collect analytics, send data to servers or load remote code.`

**activeTab:** `activeTab is needed to reach the tab where the user explicitly started the scan by pressing the button in the extension popup. The extension reads the active tab's URL to check that the page is supported and to name the resulting PDF, then injects the scanning script into that tab. Access is limited to the tab the user opened and happens only in response to their action.`

**scripting:** `scripting is used to inject the scanning script into the active tab via chrome.scripting.executeScript, only after the user presses "Scan page". The script scrolls the page so lazy images load, collects the URLs of <img> elements whose src points to an SVG, returns the list to the popup and restores the scroll position. It does not modify page content and contains no remote code — it ships inside the extension package.`

**storage:** `storage keeps two things locally: the chosen interface language ("ru" or "en") in chrome.storage.local so the choice survives popup restarts, and the last scan result for the current tab in chrome.storage.session so the list is not lost when the popup closes. Session data is cleared when the browser closes. No personal data is stored, chrome.storage.sync is not used, and nothing leaves the device.`

**Host permissions:** `The extension works on whichever page the user opens, and the list of sites cannot be known in advance — SVG icons and logos appear on any website. The access is used only after the user presses the scan button, for two operations: injecting the scanning script into the active tab, and downloading over HTTP(S) the SVG files found on that page so they can be placed into the PDF. Requests go only to the site the user scanned. The extension does not run in the background, does not read other tabs and shares nothing with third parties.`
