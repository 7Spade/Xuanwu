import { onRequest } from "firebase-functions/v2/https";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import type { protos } from "@google-cloud/documentai";
import { randomUUID } from "crypto";

if (getApps().length === 0) {
  initializeApp();
}

// Temporary hardcoded config for first successful integration.
// TODO: Replace with env vars after validation in real environment.
const DOCAI_ENDPOINT = "asia-southeast1-documentai.googleapis.com";
const DOCAI_PROCESSOR_NAME =
  "projects/65970295651/locations/asia-southeast1/processors/86a3e4af9c5bba38";

const documentAiClient = new DocumentProcessorServiceClient({
  apiEndpoint: DOCAI_ENDPOINT,
});

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

function normalizeStoragePath(path: string): string {
  return path.replace(/^\/+/, "");
}

async function resolveGcsUriFromWorkspaceRecord(payload: ProcessDocumentRequestBody): Promise<string> {
  if (payload.storagePath && payload.storagePath.trim().length > 0) {
    const defaultBucket = getStorage().bucket().name;
    return `gs://${defaultBucket}/${normalizeStoragePath(payload.storagePath.trim())}`;
  }

  if (!payload.workspaceId || !payload.fileId || !payload.versionId) {
    throw new Error("workspaceId, fileId, and versionId are required when gcsUri is not provided");
  }

  const db = getFirestore();
  const fileDoc = await db
    .collection("workspaces")
    .doc(payload.workspaceId)
    .collection("files")
    .doc(payload.fileId)
    .get();

  if (!fileDoc.exists) {
    throw new Error("Workspace file document not found");
  }

  const fileData = fileDoc.data() as {
    name?: string;
    versions?: WorkspaceFileVersionRecord[];
  };

  const versions = Array.isArray(fileData.versions) ? fileData.versions : [];
  const selectedVersion = versions.find((version) => version.versionId === payload.versionId);
  if (!selectedVersion) {
    throw new Error("Requested file version not found");
  }

  const inferredStoragePath = selectedVersion.storagePath ??
    (fileData.name ? `files-plugin/${payload.workspaceId}/${payload.fileId}/${payload.versionId}/${fileData.name}` : undefined) ??
    (payload.fileName ? `files-plugin/${payload.workspaceId}/${payload.fileId}/${payload.versionId}/${payload.fileName}` : undefined);

  if (!inferredStoragePath) {
    throw new Error("Cannot resolve storage path for selected file version");
  }

  const defaultBucket = getStorage().bucket().name;
  return `gs://${defaultBucket}/${normalizeStoragePath(inferredStoragePath)}`;
}

export const processDocument = onRequest(
  { region: "asia-east1", maxInstances: 5, timeoutSeconds: 120 },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const body = req.body as ProcessDocumentRequestBody;
    const traceId = (req.headers["x-trace-id"] as string | undefined) ?? randomUUID();
    const mimeType = body?.mimeType;

    if (!mimeType) {
      res.status(400).json({
        error: "mimeType is required",
      });
      return;
    }

    try {
      const resolvedGcsUri = body?.gcsUri?.startsWith("gs://")
        ? body.gcsUri
        : await resolveGcsUriFromWorkspaceRecord(body);

      if (!resolvedGcsUri.startsWith("gs://")) {
        res.status(400).json({ error: "Resolved gcsUri must start with gs://" });
        return;
      }

      const response = (await documentAiClient.processDocument({
        name: DOCAI_PROCESSOR_NAME,
        gcsDocument: {
          gcsUri: resolvedGcsUri,
          mimeType,
        },
        fieldMask: { paths: ["text", "entities", "pages.pageNumber"] },
      })) as [
        protos.google.cloud.documentai.v1.IProcessResponse,
        protos.google.cloud.documentai.v1.IProcessRequest | undefined,
        {} | undefined,
      ];

      const result = response[0];

      const entities: OutputEntity[] = (result.document?.entities ?? []).map(
        (entity: protos.google.cloud.documentai.v1.Document.IEntity) => ({
          type: entity.type ?? "",
          mentionText: entity.mentionText ?? "",
          confidence: entity.confidence ?? 0,
          normalizedValue: entity.normalizedValue?.text ?? undefined,
        })
      );

      res.status(200).json({
        ok: true,
        traceId,
        extractedAt: new Date().toISOString(),
        processor: DOCAI_PROCESSOR_NAME,
        mimeType,
        gcsUri: resolvedGcsUri,
        text: result.document?.text ?? "",
        entities,
        pageCount: result.document?.pages?.length ?? 0,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        ok: false,
        traceId,
        error: message,
      });
    }
  }
);
