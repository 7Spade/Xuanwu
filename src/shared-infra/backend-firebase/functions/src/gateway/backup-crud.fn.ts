import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { onRequest } from "firebase-functions/v2/https";

if (getApps().length === 0) {
  initializeApp();
}

type FirestoreAction = "create" | "read" | "update" | "delete";
type StorageAction = "create" | "read" | "update" | "delete";

interface FirestoreRequest {
  target: "firestore";
  action: FirestoreAction;
  collection: string;
  docId?: string;
  data?: Record<string, unknown>;
}

interface StorageRequest {
  target: "storage";
  action: StorageAction;
  path: string;
  bucket?: string;
  contentType?: string;
  contentBase64?: string;
}

type BackupCrudRequest = FirestoreRequest | StorageRequest;

function parseCsvEnv(name: string): string[] {
  const raw = process.env[name] ?? "";
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isPathAllowed(value: string, allowList: string[]): boolean {
  if (allowList.length === 0) return false;
  return allowList.some((prefix) => value === prefix || value.startsWith(`${prefix}/`));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasValidToken(reqToken: string | undefined): boolean {
  const configuredToken = process.env.BACKUP_CRUD_TOKEN;
  if (!configuredToken) {
    return false;
  }
  return reqToken === configuredToken;
}

async function handleFirestoreRequest(payload: FirestoreRequest) {
  const allowedCollections = parseCsvEnv("BACKUP_CRUD_ALLOWED_COLLECTIONS");
  if (!isPathAllowed(payload.collection, allowedCollections)) {
    return { status: 403, body: { error: "Collection is not in allow-list" } };
  }

  const db = getFirestore();

  if (payload.action === "create") {
    if (!isObject(payload.data)) {
      return { status: 400, body: { error: "data is required for create" } };
    }

    if (payload.docId) {
      await db.collection(payload.collection).doc(payload.docId).create(payload.data);
      return { status: 200, body: { ok: true, id: payload.docId } };
    }

    const createdRef = await db.collection(payload.collection).add(payload.data);
    return { status: 200, body: { ok: true, id: createdRef.id } };
  }

  if (!payload.docId) {
    return { status: 400, body: { error: "docId is required for read/update/delete" } };
  }

  const docRef = db.collection(payload.collection).doc(payload.docId);

  if (payload.action === "read") {
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return { status: 404, body: { error: "Document not found" } };
    }
    return { status: 200, body: { ok: true, id: snapshot.id, data: snapshot.data() } };
  }

  if (payload.action === "update") {
    if (!isObject(payload.data)) {
      return { status: 400, body: { error: "data is required for update" } };
    }
    await docRef.update(payload.data);
    return { status: 200, body: { ok: true, id: payload.docId } };
  }

  await docRef.delete();
  return { status: 200, body: { ok: true, id: payload.docId } };
}

async function handleStorageRequest(payload: StorageRequest) {
  const allowedPrefixes = parseCsvEnv("BACKUP_CRUD_ALLOWED_STORAGE_PREFIXES");
  if (!isPathAllowed(payload.path, allowedPrefixes)) {
    return { status: 403, body: { error: "Storage path is not in allow-list" } };
  }

  const storage = getStorage();
  const bucket = payload.bucket ? storage.bucket(payload.bucket) : storage.bucket();
  const file = bucket.file(payload.path);

  if (payload.action === "read") {
    const [exists] = await file.exists();
    if (!exists) {
      return { status: 404, body: { error: "File not found" } };
    }
    const [buffer] = await file.download();
    return {
      status: 200,
      body: {
        ok: true,
        path: payload.path,
        contentBase64: buffer.toString("base64"),
      },
    };
  }

  if (payload.action === "delete") {
    await file.delete({ ignoreNotFound: true });
    return { status: 200, body: { ok: true, path: payload.path } };
  }

  if (!payload.contentBase64) {
    return { status: 400, body: { error: "contentBase64 is required for create/update" } };
  }

  const buffer = Buffer.from(payload.contentBase64, "base64");
  await file.save(buffer, {
    contentType: payload.contentType ?? "application/octet-stream",
    resumable: false,
  });

  return { status: 200, body: { ok: true, path: payload.path } };
}

export const backupCrud = onRequest(
  { region: "asia-east1", maxInstances: 2 },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    if (!process.env.BACKUP_CRUD_TOKEN) {
      res.status(503).json({ error: "backup CRUD is disabled" });
      return;
    }

    const tokenHeader = req.headers["x-backup-token"];
    const requestToken = typeof tokenHeader === "string" ? tokenHeader : undefined;
    if (!hasValidToken(requestToken)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const payload = req.body as BackupCrudRequest;
    if (!payload || typeof payload !== "object") {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }

    try {
      if (payload.target === "firestore") {
        const result = await handleFirestoreRequest(payload);
        res.status(result.status).json(result.body);
        return;
      }

      if (payload.target === "storage") {
        const result = await handleStorageRequest(payload);
        res.status(result.status).json(result.body);
        return;
      }

      res.status(400).json({ error: "Unsupported target" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }
);
