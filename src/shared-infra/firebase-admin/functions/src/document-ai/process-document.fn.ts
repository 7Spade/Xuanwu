import { onRequest } from "firebase-functions/v2/https";
import { initializeApp, getApps } from "firebase-admin/app";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
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
  versionNumber?: number;
  downloadURL?: string;
  size?: number;
  uploadedBy?: string;
  versionName?: string;
  storagePath?: string;
}

interface WorkspaceFileRecord {
  name?: string;
  type?: string;
  currentVersionId?: string;
  versions?: WorkspaceFileVersionRecord[];
}

function normalizeStoragePath(path: string): string {
  return path.replace(/^\/+/, "");
}

function parseGcsUri(gcsUri: string): { bucket: string; path: string } {
  if (!gcsUri.startsWith("gs://")) {
    throw new Error("Invalid gcsUri");
  }
  const withoutScheme = gcsUri.slice(5);
  const firstSlash = withoutScheme.indexOf("/");
  if (firstSlash < 0) {
    throw new Error("Invalid gcsUri path");
  }
  return {
    bucket: withoutScheme.slice(0, firstSlash),
    path: withoutScheme.slice(firstSlash + 1),
  };
}

function removeExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot <= 0) return fileName;
  return fileName.slice(0, dot);
}

function buildFirebaseDownloadUrl(bucketName: string, objectPath: string, token: string): string {
  const encoded = encodeURIComponent(objectPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encoded}?alt=media&token=${token}`;
}

async function persistJsonArtifact(params: {
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
  const sourceNameFromPath = lastSlash >= 0 ? sourcePath.slice(lastSlash + 1) : sourcePath;
  const sourceName = params.sourceFileName && params.sourceFileName.trim().length > 0
    ? params.sourceFileName.trim()
    : sourceNameFromPath;

  const jsonFileName = `${removeExtension(sourceName)}.document-ai.json`;
  const artifactStoragePath = sourceDir.length > 0 ? `${sourceDir}/${jsonFileName}` : jsonFileName;

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
  await artifactFile.save(Buffer.from(JSON.stringify(artifactPayload, null, 2), "utf8"), {
    contentType: "application/json",
    resumable: false,
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  const artifactDownloadURL = buildFirebaseDownloadUrl(bucket.name, artifactStoragePath, token);

  const db = getFirestore();
  const artifactFileDocId = `${params.sourceFileId}--document-ai-json`;
  const artifactVersionId = `${params.sourceVersionId}--document-ai-json`;
  const artifactVersion = {
    versionId: artifactVersionId,
    versionNumber: 1,
    versionName: "Document AI JSON",
    size: Buffer.byteLength(JSON.stringify(artifactPayload), "utf8"),
    uploadedBy: "document-ai-function",
    createdAt: Timestamp.now(),
    downloadURL: artifactDownloadURL,
    storagePath: artifactStoragePath,
  };

  const artifactDocRef = db
    .collection("workspaces")
    .doc(params.workspaceId)
    .collection("files")
    .doc(artifactFileDocId);

  const artifactDocSnap = await artifactDocRef.get();
  if (!artifactDocSnap.exists) {
    await artifactDocRef.set({
      name: jsonFileName,
      type: "application/json",
      currentVersionId: artifactVersionId,
      versions: [artifactVersion],
      updatedAt: Timestamp.now(),
    });
    return { artifactStoragePath, artifactDownloadURL };
  }

  const artifactDocData = artifactDocSnap.data() as WorkspaceFileRecord;
  const existingVersions = Array.isArray(artifactDocData.versions) ? artifactDocData.versions : [];
  const existingIndex = existingVersions.findIndex((item) => item.versionId === artifactVersionId);

  if (existingIndex >= 0) {
    const replaced = [...existingVersions];
    replaced[existingIndex] = {
      ...replaced[existingIndex],
      ...artifactVersion,
      versionNumber: replaced[existingIndex]?.versionNumber ?? artifactVersion.versionNumber,
    };
    await artifactDocRef.update({
      versions: replaced,
      currentVersionId: artifactVersionId,
      updatedAt: Timestamp.now(),
    });
    return { artifactStoragePath, artifactDownloadURL };
  }

  await artifactDocRef.update({
    versions: FieldValue.arrayUnion({
      ...artifactVersion,
      versionNumber: existingVersions.length + 1,
    }),
    currentVersionId: artifactVersionId,
    updatedAt: Timestamp.now(),
  });

  return { artifactStoragePath, artifactDownloadURL };
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

  const fileData = fileDoc.data() as WorkspaceFileRecord;

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

      const sourceStoragePathFromBody = body?.storagePath?.trim();
      const sourceStoragePath = sourceStoragePathFromBody && sourceStoragePathFromBody.length > 0
        ? sourceStoragePathFromBody
        : parseGcsUri(resolvedGcsUri).path;

      const artifact = await persistJsonArtifact({
        workspaceId: body?.workspaceId,
        sourceFileId: body?.fileId,
        sourceVersionId: body?.versionId,
        sourceFileName: body?.fileName,
        sourceStoragePath,
        resolvedGcsUri,
        traceId,
        mimeType,
        text: result.document?.text ?? "",
        entities,
        pageCount: result.document?.pages?.length ?? 0,
      });

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
        artifactStoragePath: artifact?.artifactStoragePath,
        artifactDownloadURL: artifact?.artifactDownloadURL,
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
