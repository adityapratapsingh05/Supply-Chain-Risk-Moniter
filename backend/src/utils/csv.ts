import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export function parseCsvBuffer(buffer: Buffer): Record<string, string>[] {
  const text = buffer.toString('utf-8');
  const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  return result.data;
}

export function parseExcelBuffer(buffer: Buffer): Record<string, any>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
}

export function buildExcelBuffer(rows: Record<string, any>[], sheetName = 'Suppliers'): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}
