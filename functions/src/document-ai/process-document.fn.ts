/**
 * processDocument — Firebase Cloud Function (HTTP v2)
 *
 * Phase 1 of the Document Intelligence pipeline:
 *   1. Receives a POST request with workspace + file metadata
 *   2. Resolves the Firebase Storage GCS URI for the requested file/version
 *   3. Calls the Google Cloud Document AI processor (asia-east1)
 *   4. Persists an OCR JSON sidecar artifact back to Firebase Storage
 *   5. Returns the structured OcrDocumentObject for Phase 2 (Genkit AI)
 *
 * Environment:
 *   DOCAI_PROCESSOR_NAME  — full Document AI processor resource name
 *                           (projects/{id}/locations/{loc}/processors/{id})
 *   DOCAI_ENDPOINT        — regional endpoint (default: asia-east1-documentai.googleapis.com)
 *
 * Called by:
 *   file.module/_components/document-parser-view.tsx  (via fetch POST)
 *   file.module/core/_actions.ts — extractDataFromDocument server action
 *
 * Deployment:
 *   Region:       asia-east1
 *   Timeout:      120 s
 *   Max instances: 5
 */

import { onRequest } from "firebase-functions/v2/https";
import { initializeApp, getApps } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import type { protos } from "@google-cloud/documentai";
import { randomUUID } from "crypto";

if (getApps().length === 0) {
  initializeApp();
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DOCAI_ENDPOINT =
  process.env["DOCAI_ENDPOINT"] ?? "asia-east1-documentai.googleapis.com";

function getDocAiProcessorName(): string {
  const processorName = process.env["DOCAI_PROCESSOR_NAME"];
  if (!processorName) {
    throw new Error(
      "DOCAI_PROCESSOR_NAME env var is required. " +
      "Set it to: projects/{id}/locations/{loc}/processors/{id}",
    );
  }
  return processorName;
}

const documentAiClient = new DocumentProcessorServiceClient({
  apiEndpoint: DOCAI_ENDPOINT,
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProcessDocumentRequestBody {
  gcsUri?: string;
  mimeType?: string;
  workspaceId?: string;
  fileId?: string;
  versionId?: string;
  fileName?: string;
  storagePath?: string;
}

interface OutputEntity {
  type: string;
  mentionText: string;
  confidence: number;
  normalizedValue?: string;
}

interface WorkspaceFileVersionRecord {
  versionId?: string;
  storagePath?: string;
}

interface WorkspaceFileRecord {
  name?: string;
  versions?: WorkspaceFileVersionRecord[];
}

// ---------------------------------------------------------------------------
// Supported MIME types for Document AI processing
// ---------------------------------------------------------------------------

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/tiff",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "application/vnd.ms-excel", // xls
]);

function normalizeStoragePath(path: string): string {
  return path.replace(/^\/+/, "");
}

function parseGcsUri(gcsUri: string): { bucket: string; path: string } {
  if (!gcsUri.startsWith("gs://")) throw new Error("Invalid gcsUri");
  const withoutScheme = gcsUri.slice(5);
  const firstSlash = withoutScheme.indexOf("/");
  if (firstSlash < 0) throw new Error("Invalid gcsUri path");
  return {
    bucket: withoutScheme.slice(0, firstSlash),
    path: withoutScheme.slice(firstSlash + 1),
  };
}

function removeExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(0, dot) : fileName;
}

function buildFirebaseDownloadUrl(
  bucketName: string,
  objectPath: string,
  token: string,
): string {
  const encoded = encodeURIComponent(objectPath);
  return (
    `https://firebasestorage.googleapis.com/v0/b/${bucketName}` +
    `/o/${encoded}?alt=media&token=${token}`
  );
}

async function resolveGcsUri(
  payload: ProcessDocumentRequestBody,
): Promise<string> {
  if (payload.storagePath && payload.storagePath.trim().length > 0) {
    const bucket = getStorage().bucket().name;
    return `gs://${bucket}/${normalizeStoragePath(payload.storagePath.trim())}`;
  }
  if (!payload.workspaceId || !payload.fileId || !payload.versionId) {
    throw new Error(
      "workspaceId, fileId, and versionId are required when storagePath is omitted",
    );
  }
  const db = getFirestore();
  const fileDoc = await db
    .collection("workspaces")
    .doc(payload.workspaceId)
    .collection("files")
    .doc(payload.fileId)
    .get();
  if (!fileDoc.exists) throw new Error("Workspace file document not found");
  const fileData = fileDoc.data() as WorkspaceFileRecord;
  const versions = Array.isArray(fileData.versions) ? fileData.versions : [];
  const ver = versions.find((v) => v.versionId === payload.versionId);
  const storagePath =
    ver?.storagePath ??
    (fileData.name
      ? `files/${payload.workspaceId}/${payload.fileId}/${payload.versionId}/${fileData.name}`
      : undefined) ??
    (payload.fileName
      ? `files/${payload.workspaceId}/${payload.fileId}/${payload.versionId}/${payload.fileName}`
      : undefined);
  if (!storagePath) throw new Error("Cannot resolve storage path for file version");
  const bucket = getStorage().bucket().name;
  return `gs://${bucket}/${normalizeStoragePath(storagePath)}`;
}

/**
 * Writes a `.document-ai.json` sidecar artifact to Firebase Storage and
 * registers it as a virtual file document in Firestore for downstream reference.
 */
async function persistOcrSidecar(params: {
  workspaceId?: string;
  sourceFileId?: string;
  sourceVersionId?: string;
  sourceFileName?: string;
  sourceStoragePath: string;
  resolvedGcsUri: string;
  traceId: string;
  mimeType: string;
  text: string;
  entities: OutputEntity[];
  pageCount: number;
}): Promise<{ artifactStoragePath: string; artifactDownloadURL: string } | null> {
  if (!params.workspaceId || !params.sourceFileId || !params.sourceVersionId) {
    return null;
  }
  const parsed = parseGcsUri(params.resolvedGcsUri);
  const storage = getStorage();
  const bucket = storage.bucket(parsed.bucket);

  const sourcePath = normalizeStoragePath(params.sourceStoragePath);
  const lastSlash = sourcePath.lastIndexOf("/");
  const sourceDir = lastSlash >= 0 ? sourcePath.slice(0, lastSlash) : "";
  const sourceNameFromPath =
    lastSlash >= 0 ? sourcePath.slice(lastSlash + 1) : sourcePath;
  const sourceName =
    params.sourceFileName?.trim().length ? params.sourceFileName.trim() : sourceNameFromPath;

  const jsonFileName = `${removeExtension(sourceName)}.document-ai.json`;
  const artifactStoragePath =
    sourceDir.length > 0 ? `${sourceDir}/${jsonFileName}` : jsonFileName;

  const artifactPayload = {
    traceId: params.traceId,
    source: {
      workspaceId: params.workspaceId,
      fileId: params.sourceFileId,
      versionId: params.sourceVersionId,
      gcsUri: params.resolvedGcsUri,
      storagePath: sourcePath,
      mimeType: params.mimeType,
      fileName: sourceName,
    },
    parsedAt: new Date().toISOString(),
    pageCount: params.pageCount,
    text: params.text,
    entities: params.entities,
  };

  const token = randomUUID();
  const artifactFile = bucket.file(artifactStoragePath);
  await artifactFile.save(
    Buffer.from(JSON.stringify(artifactPayload, null, 2), "utf8"),
    {
      contentType: "application/json",
      resumable: false,
      metadata: { metadata: { firebaseStorageDownloadTokens: token } },
    },
  );

  const artifactDownloadURL = buildFirebaseDownloadUrl(
    bucket.name,
    artifactStoragePath,
    token,
  );

  // Register sidecar as a Firestore file record for downstream access.
  // Use set+merge to ensure idempotency and avoid non-atomic check-then-set races.
  const db = getFirestore();
  const artifactDocId = `${params.sourceFileId}--document-ai-json`;
  const artifactVersionId = `${params.sourceVersionId}--document-ai-json`;
  const artifactVersion = {
    versionId: artifactVersionId,
    versionNumber: 1,
    versionName: "Document AI JSON",
    size: Buffer.byteLength(JSON.stringify(artifactPayload), "utf8"),
    uploadedBy: "document-ai-function",
    createdAt: new Date().toISOString(),
    downloadURL: artifactDownloadURL,
    storagePath: artifactStoragePath,
  };

  const artifactRef = db
    .collection("workspaces")
    .doc(params.workspaceId)
    .collection("files")
    .doc(artifactDocId);

  // set with merge:true initialises missing fields and unions the version entry atomically.
  await artifactRef.set(
    {
      name: jsonFileName,
      mimeType: "application/json",
      currentVersionId: artifactVersionId,
      versions: FieldValue.arrayUnion(artifactVersion),
      parseStatus: "success",
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );

  return { artifactStoragePath, artifactDownloadURL };
}

// ---------------------------------------------------------------------------
// Cloud Function export
// ---------------------------------------------------------------------------

export const processDocument = onRequest(
  { region: "asia-east1", maxInstances: 5, timeoutSeconds: 120 },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const body = req.body as ProcessDocumentRequestBody;
    const traceId =
      (req.headers["x-trace-id"] as string | undefined) ?? randomUUID();
    const mimeType = body?.mimeType;

    if (!mimeType) {
      res.status(400).json({ error: "mimeType is required" });
      return;
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      res.status(400).json({
        error: `Unsupported mimeType: "${mimeType}". Allowed: ${[...ALLOWED_MIME_TYPES].join(", ")}`,
      });
      return;
    }

    try {
      const docAiProcessorName = getDocAiProcessorName();
      const resolvedGcsUri = body?.gcsUri?.startsWith("gs://")
        ? body.gcsUri
        : await resolveGcsUri(body);

      const [response] = (await documentAiClient.processDocument({
        name: docAiProcessorName,
        gcsDocument: { gcsUri: resolvedGcsUri, mimeType },
        fieldMask: { paths: ["text", "entities", "pages.pageNumber"] },
      })) as [
        protos.google.cloud.documentai.v1.IProcessResponse,
        protos.google.cloud.documentai.v1.IProcessRequest | undefined,
        Record<string, unknown> | undefined,
      ];

      const entities: OutputEntity[] = (
        response.document?.entities ?? []
      ).map(
        (
          entity: protos.google.cloud.documentai.v1.Document.IEntity,
        ): OutputEntity => ({
          type: entity.type ?? "",
          mentionText: entity.mentionText ?? "",
          confidence: entity.confidence ?? 0,
          normalizedValue: entity.normalizedValue?.text ?? undefined,
        }),
      );

      const sourceStoragePath =
        body?.storagePath?.trim() ?? parseGcsUri(resolvedGcsUri).path;

      const artifact = await persistOcrSidecar({
        workspaceId: body?.workspaceId,
        sourceFileId: body?.fileId,
        sourceVersionId: body?.versionId,
        sourceFileName: body?.fileName,
        sourceStoragePath,
        resolvedGcsUri,
        traceId,
        mimeType,
        text: response.document?.text ?? "",
        entities,
        pageCount: response.document?.pages?.length ?? 0,
      });

      res.status(200).json({
        ok: true,
        traceId,
        extractedAt: new Date().toISOString(),
        processor: docAiProcessorName,
        mimeType,
        gcsUri: resolvedGcsUri,
        text: response.document?.text ?? "",
        entities,
        pageCount: response.document?.pages?.length ?? 0,
        artifactStoragePath: artifact?.artifactStoragePath,
        artifactDownloadURL: artifact?.artifactDownloadURL,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ ok: false, traceId, error: message });
    }
  },
);
