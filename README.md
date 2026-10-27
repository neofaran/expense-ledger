# Expense Ledger

A single-page monthly expense tracker. No build step and no dependencies: open `index.html` from any https host.

## Features
- Add expenses with amount, category, date and note
- Quick add: type or dictate "45 lunch, 20 fuel yesterday", review the parsed entries, then save
- Speak button (browser speech recognition, English / Arabic / Urdu). Needs https, microphone permission, and Chrome on Android or Safari on iPhone
- Monthly total, category breakdown, daily average, month-end pace
- Monthly budget with progress bar and left-per-day figure
- Currencies: SAR, PKR, USD, AED, EUR, GBP
- Data is stored in the browser (localStorage). Use Download backup / Restore backup in Settings to move or protect it
- Optional cloud sync to your own Google Sheet, so phone and computer show the same entries (see below)

## Hosting
Serve `index.html` over https (for example Netlify, Cloudflare Pages, or GitHub Pages) so the microphone can be used.

## Cloud sync with Google Sheets
1. Create a new Google Sheet. Open Extensions > Apps Script and paste `google-apps-script/Code.gs`.
2. Change `SECRET` to a long phrase only you know.
3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone. Authorize when asked.
4. Copy the Web app URL. In the app open Settings > Cloud sync, paste the URL and the secret, then tap Connect and sync. Repeat on each device.

Entries are written to an `Expenses` tab and the budget and currency to a `Settings` tab. The app keeps a local copy, so it still works offline and syncs when you reopen it.
