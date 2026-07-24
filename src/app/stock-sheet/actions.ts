'use server';

import { createClient } from '@/lib/supabase/server';
import { getServiceAccountEmail, verifySheetAccess, readSectionRows, writeSectionColumn } from '@/lib/google/sheets';

export async function getServiceAccountInfo() {
  return { email: getServiceAccountEmail() };
}

export async function testAndSaveConnection(spreadsheetId: string) {
  const trimmedId = spreadsheetId.trim();
  if (!trimmedId) return { error: 'Paste a spreadsheet ID or URL first.' };

  // Accept either the raw ID or a pasted full Google Sheets URL.
  const idMatch = trimmedId.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const id = idMatch ? idMatch[1] : trimmedId;

  const result = await verifySheetAccess(id);
  if (!result.ok) {
    return { error: `Couldn't access that sheet: ${result.error}. Make sure you've shared it with the service account email as an Editor.` };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: 'Not signed in.' };

  const { data: membership } = await supabase
    .from('business_users')
    .select('business_id')
    .eq('user_id', userData.user.id)
    .limit(1)
    .single();
  if (!membership) return { error: 'Could not find your business.' };

  const { error } = await supabase.from('google_sheet_connections').upsert({
    business_id: membership.business_id,
    spreadsheet_id: id,
    spreadsheet_label: result.title,
    last_verified_at: new Date().toISOString(),
    last_error: null,
  }, { onConflict: 'business_id' });

  if (error) return { error: error.message };
  return { success: true, title: result.title };
}

interface SectionConfig {
  spreadsheet_id: string;
  tab_name: string;
  name_column: string;
  stock_column: string;
  estimate_column: string;
  header_row: number;
}

async function loadSectionConfig(sectionId: string): Promise<{ config?: SectionConfig; error?: string }> {
  const supabase = await createClient();
  const { data: section, error } = await supabase
    .from('stock_sections')
    .select('business_id, tab_name, name_column, stock_column, estimate_column, header_row')
    .eq('id', sectionId)
    .single();
  if (error || !section) return { error: 'Section not found.' };

  const { data: connection } = await supabase
    .from('google_sheet_connections')
    .select('spreadsheet_id')
    .eq('business_id', section.business_id)
    .single();
  if (!connection) return { error: 'No Google Sheet connected yet.' };

  return {
    config: {
      spreadsheet_id: connection.spreadsheet_id,
      tab_name: section.tab_name,
      name_column: section.name_column,
      stock_column: section.stock_column,
      estimate_column: section.estimate_column,
      header_row: section.header_row,
    },
  };
}

export async function getSectionLiveData(sectionId: string) {
  const { config, error } = await loadSectionConfig(sectionId);
  if (error || !config) return { error: error || 'Section not configured.' };

  try {
    const rows = await readSectionRows(
      config.spreadsheet_id, config.tab_name, config.name_column,
      config.stock_column, config.estimate_column, config.header_row
    );
    return { rows };
  } catch (err: any) {
    return { error: err?.errors?.[0]?.message || err?.message || 'Failed to read the sheet.' };
  }
}

export async function saveSectionStock(sectionId: string, updates: Array<{ row: number; quantity: number }>) {
  if (!updates.length) return { success: true, updated: 0 };
  const { config, error } = await loadSectionConfig(sectionId);
  if (error || !config) return { error: error || 'Section not configured.' };

  try {
    await writeSectionColumn(config.spreadsheet_id, config.tab_name, config.stock_column, updates);
    return { success: true, updated: updates.length };
  } catch (err: any) {
    return { error: err?.errors?.[0]?.message || err?.message || 'Failed to save stock to the sheet.' };
  }
}

export async function saveSectionEstimates(sectionId: string, updates: Array<{ row: number; quantity: number }>) {
  if (!updates.length) return { success: true, updated: 0 };
  const { config, error } = await loadSectionConfig(sectionId);
  if (error || !config) return { error: error || 'Section not configured.' };

  try {
    await writeSectionColumn(config.spreadsheet_id, config.tab_name, config.estimate_column, updates);
    return { success: true, updated: updates.length };
  } catch (err: any) {
    return { error: err?.errors?.[0]?.message || err?.message || 'Failed to save estimates to the sheet.' };
  }
}
