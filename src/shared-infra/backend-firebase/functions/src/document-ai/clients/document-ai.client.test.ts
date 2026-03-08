import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Mock firebase-admin/app before importing the client ───────────────────────
const { mockGetApp } = vi.hoisted(() => ({
  mockGetApp: vi.fn(),
}));

vi.mock('firebase-admin/app', () => ({
  getApp: mockGetApp,
}));

import { callDocumentAi, PROCESSOR_URLS } from './document-ai.client.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCredential(token = 'mock-access-token') {
  return {
    getAccessToken: vi.fn().mockResolvedValue({ access_token: token }),
  };
}

function makeApp(token = 'mock-access-token') {
  return { options: { credential: makeCredential(token) } };
}

/** Build a minimal Response-like object accepted by the mocked fetch */
function makeResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
  } as unknown as Response;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('PROCESSOR_URLS', () => {
  it('CLASSIFIER contains the correct project and processor id', () => {
    expect(PROCESSOR_URLS.CLASSIFIER).toContain('94f84cf3b653b085');
    expect(PROCESSOR_URLS.CLASSIFIER).toContain('asia-southeast1-documentai.googleapis.com');
  });

  it('EXTRACTOR contains the correct project and processor id', () => {
    expect(PROCESSOR_URLS.EXTRACTOR).toContain('86a3e4af9c5bba38');
    expect(PROCESSOR_URLS.EXTRACTOR).toContain('asia-southeast1-documentai.googleapis.com');
  });
});

describe('callDocumentAi', () => {
  beforeEach(() => {
    mockGetApp.mockReset();
    vi.restoreAllMocks();
  });

  it('does not retry when API returns 429', async () => {
    mockGetApp.mockReturnValue(makeApp());

    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(makeResponse({ error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'Quota exceeded' } }, 429));

    await expect(
      callDocumentAi(
        PROCESSOR_URLS.EXTRACTOR,
        'gs://my-bucket/doc.pdf',
        'application/pdf'
      )
    ).rejects.toThrow('Quota exceeded');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('sends a GCS URI as gcsDocument in the request body', async () => {
    mockGetApp.mockReturnValue(makeApp());

    const apiResponse = { document: { text: 'hello' } };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeResponse(apiResponse));

    const result = await callDocumentAi(
      PROCESSOR_URLS.CLASSIFIER,
      'gs://my-bucket/doc.pdf',
      'application/pdf'
    );

    expect(result).toEqual(apiResponse);

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(PROCESSOR_URLS.CLASSIFIER);
    expect(init.method).toBe('POST');

    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body).toHaveProperty('gcsDocument');
    expect((body.gcsDocument as Record<string, string>).gcsUri).toBe('gs://my-bucket/doc.pdf');
    expect((body.gcsDocument as Record<string, string>).mimeType).toBe('application/pdf');
    expect(body).not.toHaveProperty('rawDocument');
  });

  it('sends a base64 data URI as rawDocument in the request body', async () => {
    mockGetApp.mockReturnValue(makeApp());

    const b64Payload = Buffer.from('%PDF-1.4 fake').toString('base64');
    const dataUri = `data:application/pdf;base64,${b64Payload}`;

    const apiResponse = { document: { text: 'pdf content' } };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeResponse(apiResponse));

    await callDocumentAi(PROCESSOR_URLS.EXTRACTOR, dataUri, 'application/pdf');

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as Record<string, unknown>;

    expect(body).toHaveProperty('rawDocument');
    expect((body.rawDocument as Record<string, string>).content).toBe(b64Payload);
    expect(body).not.toHaveProperty('gcsDocument');
  });

  it('attaches the Bearer token from the Admin SDK credential', async () => {
    mockGetApp.mockReturnValue(makeApp('test-token-xyz'));

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeResponse({ document: {} }));

    await callDocumentAi(PROCESSOR_URLS.CLASSIFIER, 'gs://b/f.pdf', 'application/pdf');

    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const headers = init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer test-token-xyz');
  });

  it('throws when the API returns a non-OK response', async () => {
    mockGetApp.mockReturnValue(makeApp());
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeResponse('Quota exceeded', 429));

    await expect(
      callDocumentAi(PROCESSOR_URLS.CLASSIFIER, 'gs://b/f.pdf', 'application/pdf')
    ).rejects.toThrow('429');
  });

  it('throws when no credential is configured on the App', async () => {
    mockGetApp.mockReturnValue({ options: {} });

    await expect(
      callDocumentAi(PROCESSOR_URLS.CLASSIFIER, 'gs://b/f.pdf', 'application/pdf')
    ).rejects.toThrow('No Firebase Admin credential found');
  });

  it('throws when the documentUri is neither gs:// nor a valid data URI', async () => {
    mockGetApp.mockReturnValue(makeApp());

    await expect(
      callDocumentAi(PROCESSOR_URLS.CLASSIFIER, 'https://example.com/doc.pdf', 'application/pdf')
    ).rejects.toThrow('must be a gs:// URI or a base64 data URI');
  });
});
