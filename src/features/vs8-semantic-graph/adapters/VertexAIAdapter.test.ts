/**
 * Module: VertexAIAdapter.test.ts
 * Purpose: Verify the Vertex AI semantic adapter builds tenant-scoped, trace-aware requests.
 * Responsibilities: validate vector search filters, embedding model usage, and upsert payload shape.
 * Constraints: deterministic logic, respect module boundaries
 */

import { describe, expect, it, vi } from 'vitest';

import {
  buildVertexAuthorityFilter,
  buildVertexRestrictedValues,
  DEFAULT_VERTEX_TEXT_EMBEDDING_MODEL,
  VertexAIAdapter,
} from './VertexAIAdapter';

function createMockResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function parseJsonObject(input: string | null | undefined): Record<string, unknown> {
  const parsed = JSON.parse(String(input));

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Expected a JSON object payload.');
  }

  return parsed;
}

function expectObject(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }

  return value as Record<string, unknown>;
}

function getMockCall(fetchMock: ReturnType<typeof vi.fn>, index: number): [string, RequestInit | undefined] {
  const call = fetchMock.mock.calls[index];

  if (!call) {
    throw new Error(`Expected fetch call at index ${index}.`);
  }

  return [String(call[0]), call[1] as RequestInit | undefined];
}

describe('VertexAIAdapter', () => {
  it('injects authority filter and trace headers when searching', async () => {
    const fetchMock = vi.fn(async () => createMockResponse({ results: [] }));

    const adapter = new VertexAIAdapter({
      projectId: 'demo-project',
      location: 'us-central1',
      collectionId: 'semantic-vector-search',
      getAccessToken: async () => 'token-123',
    }, fetchMock);

    await adapter.searchSimilar([0.1, 0.2, 0.3], {
      authority: 'org:acme',
      traceId: 'trace-001',
      topK: 4,
    });

    const [url, init] = getMockCall(fetchMock, 0);
    expect(url).toContain('/dataObjects:search');
    expect(init?.headers).toMatchObject({
      Authorization: 'Bearer token-123',
      'x-trace-id': 'trace-001',
    });

    const body = parseJsonObject(String(init?.body));
    const vectorSearch = expectObject(body.vector_search, 'vector_search');
    const filter = expectObject(vectorSearch.filter, 'vector_search.filter');

    expect(filter).toEqual(buildVertexAuthorityFilter('org:acme'));
    expect(vectorSearch.top_k).toBe(4);
  });

  it('vectorizes with text-embedding-004 and upserts authority-scoped metadata', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createMockResponse({
        predictions: [
          {
            embeddings: {
              values: [0.9, 0.1],
            },
          },
        ],
      }))
      .mockResolvedValueOnce(createMockResponse({}));

    const adapter = new VertexAIAdapter({
      projectId: 'demo-project',
      location: 'us-central1',
      collectionId: 'semantic-vector-search',
      getAccessToken: async () => 'token-123',
    }, fetchMock);

    await adapter.upsertTag('tag::skill/safety', {
      authority: 'org:acme',
      label: 'Safety',
      sourceText: 'tag::skill/safety Safety',
      category: 'skill',
      tags: ['governed'],
    }, {
      traceId: 'trace-002',
    });

    const [embeddingUrl, embeddingInit] = getMockCall(fetchMock, 0);
    expect(String(embeddingUrl)).toContain(DEFAULT_VERTEX_TEXT_EMBEDDING_MODEL);
    expect(embeddingInit?.headers).toMatchObject({
      'x-trace-id': 'trace-002',
    });

    const [upsertUrl, upsertInit] = getMockCall(fetchMock, 1);
    expect(String(upsertUrl)).toContain('dataObjectId=tag%3A%3Askill%2Fsafety');

    const upsertBody = parseJsonObject(String(upsertInit?.body));
    const data = expectObject(upsertBody.data, 'data');
    const metadata = expectObject(upsertBody.metadata, 'metadata');
    const vectors = expectObject(upsertBody.vectors, 'vectors');

    expect(data).toMatchObject({
      authority: 'org:acme',
      tagSlug: 'tag::skill/safety',
    });
    expect(metadata.embeddingModel).toBe(DEFAULT_VERTEX_TEXT_EMBEDDING_MODEL);
    expect(metadata.restrictedValues).toEqual(buildVertexRestrictedValues('org:acme'));
    expect(metadata.traceId).toBe('trace-002');
    expect(vectors.semantic_embedding).toEqual([0.9, 0.1]);
  });

  it('fails fast when the embedding response does not contain a usable vector', async () => {
    const fetchMock = vi.fn(async () => createMockResponse({
      predictions: [
        {
          embeddings: {
            values: [],
          },
        },
      ],
    }));

    const adapter = new VertexAIAdapter({
      projectId: 'demo-project',
      location: 'us-central1',
      collectionId: 'semantic-vector-search',
      getAccessToken: async () => 'token-123',
    }, fetchMock);

    await expect(adapter.upsertTag('tag::skill/safety', {
      authority: 'org:acme',
      label: 'Safety',
      sourceText: 'tag::skill/safety Safety',
    })).rejects.toThrow('embedding must not be empty');
  });
});
