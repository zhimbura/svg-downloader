# Политика конфиденциальности — SVG Downloadr

Версия 1.0, действует с 8 августа 2026 года.
Английская версия — [ниже](#privacy-policy--svg-downloadr).

## Коротко

Расширение работает целиком в браузере. Оно не отправляет никакие данные разработчику
или третьим лицам, не собирает аналитику, не показывает рекламу и не содержит трекеров.
Сервера у расширения нет.

## Какие данные обрабатываются

Чтобы выполнить свою задачу, расширение обращается к содержимому страницы, которую вы сами
открыли и на которой сами нажали «Сканировать страницу»:

| Что | Зачем | Где остаётся |
|---|---|---|
| Адреса `<img>` с SVG на просканированной странице | Показать список найденного и загрузить эти файлы | В памяти вкладки и в `chrome.storage.session` |
| Содержимое самих SVG-файлов | Собрать из них PDF | В памяти попапа, только на время сборки |
| Готовый PDF | Отдать вам файл | Скачивается стандартным механизмом загрузок Chrome в вашу папку загрузок |
| Выбранный язык интерфейса | Запомнить выбор между запусками | В `chrome.storage.local` на вашем устройстве |

`chrome.storage.session` очищается при закрытии браузера. `chrome.storage.local` содержит
только код языка (`ru` или `en`) и удаляется вместе с расширением.

## Что расширение не делает

- Не передаёт содержимое страниц, адреса, файлы и PDF на какие-либо серверы.
- Не собирает статистику использования, идентификаторы устройства, IP-адреса и cookies.
- Не читает историю браузера, пароли и данные автозаполнения.
- Не сканирует страницы в фоне: сканирование запускается только по вашему нажатию.
- Не загружает и не выполняет удалённый код — все библиотеки (Vue, jsPDF, svg2pdf.js)
  собраны внутрь пакета расширения.
- Не продаёт и не передаёт данные третьим лицам, потому что данных у разработчика нет.

## Сетевые запросы

Единственные сетевые запросы, которые делает расширение, — это загрузка самих SVG-файлов
с того сайта, который вы просканировали. Запросы идут напрямую к этому сайту, как если бы
вы открыли картинку в отдельной вкладке, и выполняются с вашими обычными cookies, чтобы
изображения на сайтах, требующих авторизации, тоже открывались. Никаких других адресов
расширение не запрашивает.

## Разрешения

- **Доступ к сайтам** — чтобы просканировать открытую вами вкладку и загрузить с неё SVG-файлы.
  Разрешение объявлено для всех сайтов, потому что заранее неизвестно, где вам понадобится
  расширение; фактически оно используется только на той вкладке, где вы нажали кнопку.
- **`activeTab`** — доступ к активной вкладке в момент нажатия кнопки.
- **`scripting`** — внедрение скрипта сканирования в текущую вкладку по вашему действию.
- **`storage`** — хранение языка интерфейса и результата последнего сканирования.

## Дети

Расширение не предназначено специально для детей и не собирает данные о них — как и о любых
других пользователях.

## Изменения политики

Актуальная версия документа всегда находится в репозитории проекта. Если политика изменится,
здесь появится новая версия и дата.

## Контакты

Вопросы по обработке данных — через issues репозитория:
https://github.com/zhimbura/svg-downloader/issues

---

# Privacy Policy — SVG Downloadr

Version 1.0, effective 8 August 2026.

## In short

The extension runs entirely inside your browser. It sends no data to the developer or to any
third party, collects no analytics, shows no ads and contains no trackers. The extension has
no server.

## What data is processed

To do its job, the extension accesses the content of the page that you opened yourself and on
which you pressed "Scan page":

| What | Why | Where it stays |
|---|---|---|
| URLs of `<img>` elements with SVG on the scanned page | To show the list and download those files | In the tab's memory and in `chrome.storage.session` |
| The contents of the SVG files | To build the PDF | In the popup's memory, only while the PDF is being built |
| The resulting PDF | To hand you the file | Downloaded through Chrome's standard download mechanism into your downloads folder |
| The selected interface language | To remember your choice | In `chrome.storage.local` on your device |

`chrome.storage.session` is cleared when the browser closes. `chrome.storage.local` holds only
a language code (`ru` or `en`) and is removed together with the extension.

## What the extension does not do

- It does not transmit page contents, URLs, files or PDFs to any server.
- It does not collect usage statistics, device identifiers, IP addresses or cookies.
- It does not read your browsing history, passwords or autofill data.
- It does not scan pages in the background: scanning starts only when you press the button.
- It does not download or execute remote code — every library (Vue, jsPDF, svg2pdf.js) is
  bundled into the extension package.
- It does not sell or share data with third parties, because the developer holds no data.

## Network requests

The only network requests the extension makes are downloads of the SVG files from the site you
scanned. They go directly to that site, exactly as if you opened the image in a separate tab,
and they carry your usual cookies so that images on sites requiring a login can be fetched too.
No other addresses are contacted.

## Permissions

- **Site access** — to scan the tab you opened and to download the SVG files from it. The
  permission is declared for all sites because there is no way to know in advance where you
  will need the extension; in practice it is used only on the tab where you pressed the button.
- **`activeTab`** — access to the active tab at the moment you press the button.
- **`scripting`** — injecting the scanning script into the current tab upon your action.
- **`storage`** — storing the interface language and the last scan result.

## Children

The extension is not directed at children and collects no data about them — nor about any
other users.

## Changes

The current version of this document always lives in the project repository. If the policy
changes, a new version and date will appear here.

## Contact

Questions about data handling: https://github.com/zhimbura/svg-downloader/issues
