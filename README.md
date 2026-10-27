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

## Hosting
Serve `index.html` over https (for example Netlify, Cloudflare Pages, or GitHub Pages) so the microphone can be used.
