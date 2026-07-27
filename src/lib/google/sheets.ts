import 'server-only';
import { google } from 'googleapis';

// One shared WITH-IN service account talks to every connected business's
// Google Sheet. Each business grants access by sharing their own sheet with
// this service account's email as an Editor — no per-business OAuth needed.
//
// Requires GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
// (or GOOGLE_SERVICE_ACCOUNT_KEY_JSON containing the full downloaded JSON key)
// as server-only environment variables — never prefix these with NEXT_PUBLIC_.

function loadCredentials(): { client_email: string; private_key: string } {
  const inlineJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON;
  if (inlineJson) {
    try {
      const parsed = JSON.parse(inlineJson);
      return { client_email: parsed.client_email, private_key: parsed.private_key };
    } catch {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY_JSON is set but is not valid JSON.');
    }
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !key) {
    throw new Error(
      'Google Sheets isn\u2019t configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and ' +
      'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (or GOOGLE_SERVICE_ACCOUNT_KEY_JSON) in your environment.'
    );
  }
  // Private keys are usually stored with literal \n sequences in env vars —
  // convert them back to real newlines, or the key fails to parse.
  return { client_email: email, private_key: key.replace(/\\n/g, '\n') };
}

/** The service account email businesses need to share their sheet with. */
export function getServiceAccountEmail(): string | null {
  try {
    return loadCredentials().client_email;
  } catch {
    return null;
  }
}

async function getSheetsClient() {
  const credentials = loadCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient as any });
}

/** Confirms we can actually read the sheet (validates ID + sharing permission). */
export async function verifySheetAccess(spreadsheetId: string): Promise<{ ok: true; title: string } | { ok: false; error: string }> {
  try {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.get({ spreadsheetId });
    return { ok: true, title: res.data.properties?.title || 'Untitled spreadsheet' };
  } catch (err: any) {
    const message = err?.errors?.[0]?.message || err?.message || 'Could not access this spreadsheet.';
    return { ok: false, error: message };
  }
}

export interface CustomerSheetRow {
  name: string;
  driver: string | null;
  sortOrder: number;
}

/** Reads customer name + driver columns from a tab, matching the reference app's mechanics: dedupes by name (first occurrence wins), preserves sheet row order as sort_order. */
export async function readCustomerRows(
  spreadsheetId: string,
  tabName: string,
  nameCol: string,
  driverCol: string,
  headerRow: number
): Promise<CustomerSheetRow[]> {
  const sheets = await getSheetsClient();
  const lastCol = [nameCol, driverCol].sort().pop() || 'D';
  const startRow = headerRow + 1;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A${startRow}:${lastCol}5000`,
  });
  const rows = (res.data.values as string[][]) ?? [];

  const colIndex = (col: string) => col.toUpperCase().charCodeAt(0) - 65;
  const nameIdx = colIndex(nameCol);
  const driverIdx = colIndex(driverCol);

  const seen = new Map<string, CustomerSheetRow>();
  let order = 0;
  for (const r of rows) {
    const name = (r[nameIdx] || '').trim();
    if (!name || seen.has(name)) continue;
    order += 1;
    seen.set(name, { name, driver: (r[driverIdx] || '').trim() || null, sortOrder: order });
  }
  return Array.from(seen.values());
}

export interface SectionRow {
  row: number;
  name: string;
  stock: number;
  estimate: number;
}

/** Reads product name / stock / estimate columns for a configured section (tab). */
export async function readSectionRows(
  spreadsheetId: string,
  tabName: string,
  nameCol: string,
  stockCol: string,
  estimateCol: string,
  headerRow: number
): Promise<SectionRow[]> {
  const sheets = await getSheetsClient();
  const lastCol = [nameCol, stockCol, estimateCol].sort().pop() || 'G';
  const startRow = headerRow + 1;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A${startRow}:${lastCol}2000`,
  });
  const rows = (res.data.values as string[][]) ?? [];

  const colIndex = (col: string) => col.toUpperCase().charCodeAt(0) - 65;
  const nameIdx = colIndex(nameCol);
  const stockIdx = colIndex(stockCol);
  const estimateIdx = colIndex(estimateCol);

  return rows
    .map((r, i) => ({
      row: startRow + i,
      name: (r[nameIdx] || '').trim(),
      stock: Number(r[stockIdx]) || 0,
      estimate: Number(r[estimateIdx]) || 0,
    }))
    .filter((r) => r.name.length > 0);
}

/** Writes a batch of quantities into a single column on a tab. */
export async function writeSectionColumn(
  spreadsheetId: string,
  tabName: string,
  column: string,
  updates: Array<{ row: number; quantity: number }>
): Promise<void> {
  if (!updates.length) return;
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: updates.map((u) => ({
        range: `${tabName}!${column}${u.row}`,
        values: [[u.quantity > 0 ? String(u.quantity) : '']],
      })),
    },
  });
}
