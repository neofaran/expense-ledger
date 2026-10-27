/**
 * Expense Ledger: Google Sheet sync
 *
 * Setup (once):
 * 1. Create a new Google Sheet. Open Extensions > Apps Script and paste this whole file.
 * 2. Change SECRET below to a long phrase only you know.
 * 3. Click Deploy > New deployment > type "Web app".
 *    Execute as: Me.  Who has access: Anyone.  Click Deploy and authorize.
 * 4. Copy the Web app URL. In the Expense Ledger app, open Settings > Cloud sync,
 *    paste the URL and the same secret, then tap "Connect and sync".
 *
 * After you change this file, use Deploy > Manage deployments > edit > New version.
 */
const SECRET = 'change-this-secret';
const EXPENSE_HEADERS = ['id', 'date', 'category', 'amount', 'note', 'createdAt'];

function doGet() {
  return reply({ ok: true, message: 'Expense Ledger sync is running.' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  let locked = false;
  try {
    lock.waitLock(20000);
    locked = true;
    const req = JSON.parse(e.postData.contents);
    if (req.key !== SECRET) { return reply({ ok: false, error: 'Wrong secret' }); }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = getSheet(ss, 'Expenses', EXPENSE_HEADERS);
    const st = getSheet(ss, 'Settings', ['key', 'value']);
    switch (req.action) {
      case 'list':
        return reply({ ok: true, expenses: readExpenses(sh), settings: readSettings(st) });
      case 'add':
        addExpenses(sh, [req.expense]);
        return reply({ ok: true });
      case 'addMany':
        addExpenses(sh, req.expenses || []);
        return reply({ ok: true });
      case 'remove':
        removeExpense(sh, req.id);
        return reply({ ok: true });
      case 'settings':
        writeSettings(st, req.settings || {});
        return reply({ ok: true });
      default:
        return reply({ ok: false, error: 'Unknown action' });
    }
  } catch (err) {
    return reply({ ok: false, error: String((err && err.message) || err) });
  } finally {
    if (locked) { lock.releaseLock(); }
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sh;
}

function readExpenses(sh) {
  const last = sh.getLastRow();
  if (last < 2) { return []; }
  const tz = Session.getScriptTimeZone();
  return sh.getRange(2, 1, last - 1, 6).getValues()
    .filter(function (r) { return r[0] !== ''; })
    .map(function (r) {
      return {
        id: String(r[0]),
        date: r[1] instanceof Date ? Utilities.formatDate(r[1], tz, 'yyyy-MM-dd') : String(r[1]),
        category: String(r[2]),
        amount: Number(r[3]),
        note: String(r[4] || ''),
        createdAt: Number(r[5]) || 0
      };
    });
}

function existingIds(sh) {
  const last = sh.getLastRow();
  if (last < 2) { return []; }
  return sh.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); });
}

function addExpenses(sh, list) {
  const have = {};
  existingIds(sh).forEach(function (id) { have[id] = true; });
  const rows = [];
  list.forEach(function (e) {
    if (!e || !e.id || have[String(e.id)]) { return; }
    const amount = Number(e.amount);
    if (!(amount > 0) || typeof e.date !== 'string') { return; }
    have[String(e.id)] = true;
    rows.push([String(e.id), e.date, String(e.category || 'Other'), amount, String(e.note || ''), Number(e.createdAt) || 0]);
  });
  if (!rows.length) { return; }
  const start = sh.getLastRow() + 1;
  const range = sh.getRange(start, 1, rows.length, 6);
  range.setNumberFormat('@');                                   // keep ids and dates as plain text
  sh.getRange(start, 4, rows.length, 1).setNumberFormat('0.00'); // amount stays a number for totals
  sh.getRange(start, 6, rows.length, 1).setNumberFormat('0');
  range.setValues(rows);
}

function removeExpense(sh, id) {
  const idx = existingIds(sh).indexOf(String(id));
  if (idx !== -1) { sh.deleteRow(idx + 2); }
}

function readSettings(st) {
  const last = st.getLastRow();
  if (last < 2) { return null; }
  const map = {};
  st.getRange(2, 1, last - 1, 2).getValues().forEach(function (r) { map[r[0]] = r[1]; });
  return { budget: Number(map.budget) || 0, currency: String(map.currency || 'SAR') };
}

function writeSettings(st, s) {
  st.getRange(2, 1, 2, 2).setValues([['budget', Number(s.budget) || 0], ['currency', String(s.currency || 'SAR')]]);
}
