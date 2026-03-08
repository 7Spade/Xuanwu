import { onRequest } from "firebase-functions/v2/https";
import { initializeApp, getApps } from "firebase-admin/app";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import type { protos } from "@google-cloud/documentai";

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
}

interface OutputEntity {
  type: string;
  mentionText: string;
  confidence: number;
  normalizedValue?: string;
}

export const processDocument = onRequest(
  { region: "asia-east1", maxInstances: 5, timeoutSeconds: 120 },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const body = req.body as ProcessDocumentRequestBody;
    const gcsUri = body?.gcsUri;
    const mimeType = body?.mimeType;

    if (!gcsUri || !mimeType) {
      res.status(400).json({
        error: "gcsUri and mimeType are required",
      });
      return;
    }

    if (!gcsUri.startsWith("gs://")) {
      res.status(400).json({ error: "gcsUri must start with gs://" });
      return;
    }

    try {
      const response = (await documentAiClient.processDocument({
        name: DOCAI_PROCESSOR_NAME,
        gcsDocument: {
          gcsUri,
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
        processor: DOCAI_PROCESSOR_NAME,
        text: result.document?.text ?? "",
        entities,
        pageCount: result.document?.pages?.length ?? 0,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        ok: false,
        error: message,
      });
    }
  }
);
