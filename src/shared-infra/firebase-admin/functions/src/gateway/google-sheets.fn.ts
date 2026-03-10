/**
 * Module: google-sheets.fn
 * Purpose: Expose a minimal HTTPS gateway for reading and appending Google Sheets rows.
 * Responsibilities: Validate request input, call Sheets API via ADC, and map errors to HTTP responses.
 * Constraints: deterministic logic, respect module boundaries
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { google } from "googleapis";

const GOOGLE_SHEET_ID = defineSecret("GOOGLE_SHEET_ID");

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const DEFAULT_RANGE = "Sheet1!A1:Z200";
const MAX_ROWS_PER_APPEND = 100;
const MAX_COLUMNS_PER_ROW = 32;

type JsonPrimitive = string | number | boolean | null;
type JsonRow = JsonPrimitive[];

interface AppendPayload {
  range?: string;
  values: JsonRow[];
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isSafeRange(value: string): boolean {
  if (value.length === 0 || value.length > 128) {
    return false;
  }

  return /^[A-Za-z0-9_\- ]+![A-Z]+[0-9]+:[A-Z]+[0-9]+$/.test(value);
}

function isJsonPrimitive(value: unknown): value is JsonPrimitive {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function isJsonRow(value: unknown): value is JsonRow {
  return Array.isArray(value) && value.length <= MAX_COLUMNS_PER_ROW && value.every(isJsonPrimitive);
}

function isAppendPayload(value: unknown): value is AppendPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  if (!Array.isArray(payload.values) || payload.values.length === 0 || payload.values.length > MAX_ROWS_PER_APPEND) {
    return false;
  }

  if (payload.range !== undefined && !isString(payload.range)) {
    return false;
  }

  return payload.values.every(isJsonRow);
}

async function createSheetsClient() {
  const auth = new google.auth.GoogleAuth({ scopes: [SHEETS_SCOPE] });
  return google.sheets({ version: "v4", auth });
}

function normalizeRange(input: string | undefined): string {
  if (!input) {
    return DEFAULT_RANGE;
  }

  const trimmed = input.trim();
  if (!isSafeRange(trimmed)) {
    throw new Error("Invalid range format. Expected pattern: Sheet1!A1:C20");
  }

  return trimmed;
}

export const googleSheets = onRequest(
  {
    region: "asia-east1",
    maxInstances: 2,
    secrets: [GOOGLE_SHEET_ID],
  },
  async (req, res) => {
    if (req.method !== "GET" && req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const spreadsheetId = GOOGLE_SHEET_ID.value().trim();
    if (!spreadsheetId) {
      res.status(503).json({ error: "GOOGLE_SHEET_ID secret is missing" });
      return;
    }

    try {
      const sheets = await createSheetsClient();

      if (req.method === "GET") {
        const rangeFromQuery = Array.isArray(req.query.range) ? req.query.range[0] : req.query.range;
        const range = normalizeRange(isString(rangeFromQuery) ? rangeFromQuery : undefined);

        const result = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });

        res.status(200).json({
          range: result.data.range ?? range,
          rows: result.data.values ?? [],
        });
        return;
      }

      const payload: unknown = req.body;
      if (!isAppendPayload(payload)) {
        res.status(400).json({ error: "Invalid payload. Expected { range?: string, values: (string|number|boolean|null)[][] }" });
        return;
      }

      const range = normalizeRange(payload.range);
      const appendResult = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: payload.values,
        },
      });

      res.status(200).json({
        updatedRange: appendResult.data.updates?.updatedRange ?? null,
        updatedRows: appendResult.data.updates?.updatedRows ?? 0,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }
);
