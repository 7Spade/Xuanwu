/**
 * Module: VertexAIAdapter.ts
 * Purpose: Provide a trace-aware, tenant-scoped adapter for Vertex AI semantic vector search.
 * Responsibilities: vectorize tags with text-embedding-004, upsert semantic tags, execute similarity search.
 * Constraints: deterministic logic, respect module boundaries
 */

export const DEFAULT_VERTEX_TEXT_EMBEDDING_MODEL = 'text-embedding-004';
export const DEFAULT_VECTOR_SEARCH_FIELD = 'semantic_embedding';

export interface SemanticVectorTagMetadata {
  readonly authority: string;
  readonly label: string;
  readonly sourceText: string;
  readonly category?: string;
  readonly description?: string;
  readonly locale?: string;
  readonly tags?: readonly string[];
  readonly isActive?: boolean;
}

export interface SemanticVectorSearchOptions {
  readonly authority: string;
  readonly topK?: number;
  readonly traceId?: string;
  readonly outputFields?: SemanticVectorOutputFields;
}

export interface SemanticVectorUpsertOptions {
  readonly traceId?: string;
}

export interface AuthorityFilter {
  readonly authority: {
    readonly $eq: string;
  };
}

export interface RestrictedValueEnvelope {
  readonly authority: readonly string[];
}

export interface SemanticVectorMatch {
  readonly id: string;
  readonly score: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface SemanticVectorOutputFields {
  readonly dataFields?: string;
  readonly vectorFields?: string;
  readonly metadataFields?: string;
}

export interface SemanticVectorClient {
  searchSimilar(
    queryVector: readonly number[],
    options: SemanticVectorSearchOptions,
  ): Promise<readonly SemanticVectorMatch[]>;

  upsertTag(
    tagSlug: string,
    metadata: SemanticVectorTagMetadata,
    options?: SemanticVectorUpsertOptions,
  ): Promise<void>;
}

/**
 * Runtime configuration contract for the Vertex AI semantic adapter.
 *
 * Callers must provide stable project/location/collection identifiers and an
 * access-token supplier. Secrets stay outside the adapter and are resolved by
 * the composition root.
 */
export interface VertexAIAdapterConfig {
  readonly projectId: string;
  readonly location: string;
  readonly collectionId: string;
  readonly embeddingModel?: string;
  readonly vectorSearchField?: string;
  readonly getAccessToken: () => Promise<string>;
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

interface VertexEmbeddingPrediction {
  readonly predictions?: ReadonlyArray<{
    readonly embeddings?: {
      readonly values?: readonly number[];
    };
  }>;
}

interface VertexVectorSearchResponse {
  readonly results?: ReadonlyArray<{
    readonly distance?: number;
    readonly score?: number;
    readonly data_object?: {
      readonly id?: string;
      readonly name?: string;
      readonly data_fields?: Readonly<Record<string, unknown>>;
      readonly metadata_fields?: Readonly<Record<string, unknown>>;
    };
  }>;
}

type VertexVectorSearchResult = NonNullable<VertexVectorSearchResponse['results']>[number];

function assertNonEmptyVector(vector: readonly number[], label: string): void {
  if (vector.length === 0) {
    throw new Error(`${label} must not be empty.`);
  }
}

function normalizeSearchScore(
  searchResult: VertexVectorSearchResult,
): number {
  if (typeof searchResult.score === 'number') {
    return searchResult.score;
  }
  if (typeof searchResult.distance === 'number') {
    return 1 - searchResult.distance;
  }
  return 0;
}

export function buildVertexAuthorityFilter(authority: string): AuthorityFilter {
  return {
    authority: {
      $eq: authority,
    },
  };
}

export function buildVertexRestrictedValues(authority: string): RestrictedValueEnvelope {
  return {
    authority: [authority],
  };
}

function resolveOutputFields(
  options: SemanticVectorSearchOptions,
): Required<SemanticVectorOutputFields> {
  return {
    dataFields: options.outputFields?.dataFields ?? '*',
    vectorFields: options.outputFields?.vectorFields ?? '*',
    metadataFields: options.outputFields?.metadataFields ?? '*',
  };
}

/**
 * Trace-aware adapter that bridges VS8 semantic operations to Vertex AI.
 *
 * Responsibilities:
 * - vectorize Tag payloads with `text-embedding-004`
 * - apply tenant isolation through `authority` metadata filters
 * - preserve `traceId` across search and upsert requests
 *
 * Constraints:
 * - semantic-only adapter; no XP, workflow, or notification logic
 * - credentials must come from the injected access-token provider
 */
export class VertexAIAdapter implements SemanticVectorClient {
  private readonly fetcher: FetchLike;
  private readonly embeddingModel: string;
  private readonly vectorSearchField: string;

  public constructor(
    private readonly config: VertexAIAdapterConfig,
    fetcher: FetchLike = VertexAIAdapter.resolveDefaultFetch(),
  ) {
    this.fetcher = fetcher;
    this.embeddingModel = config.embeddingModel ?? DEFAULT_VERTEX_TEXT_EMBEDDING_MODEL;
    this.vectorSearchField = config.vectorSearchField ?? DEFAULT_VECTOR_SEARCH_FIELD;
  }

  public async searchSimilar(
    queryVector: readonly number[],
    options: SemanticVectorSearchOptions,
  ): Promise<readonly SemanticVectorMatch[]> {
    assertNonEmptyVector(queryVector, 'queryVector');
    const resolvedOutputFields = resolveOutputFields(options);

    const body = {
      vector_search: {
        search_field: this.vectorSearchField,
        vector: {
          values: queryVector,
        },
        filter: buildVertexAuthorityFilter(options.authority),
        top_k: options.topK ?? 10,
        output_fields: {
          data_fields: resolvedOutputFields.dataFields,
          vector_fields: resolvedOutputFields.vectorFields,
          metadata_fields: resolvedOutputFields.metadataFields,
        },
      },
    };

    const response = await this.authorizedFetch(
      this.buildVectorSearchUrl(':search'),
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      options.traceId,
      'vector-search',
    );

    const payload = await this.readJson<VertexVectorSearchResponse>(response);
    return (payload.results ?? []).map((searchResult) => {
      const identifier = searchResult.data_object?.id ?? searchResult.data_object?.name;

      if (!identifier) {
        throw new Error('Vertex AI search result is missing both id and name.');
      }

      return {
        id: identifier,
        score: normalizeSearchScore(searchResult),
        metadata: {
          ...(searchResult.data_object?.data_fields ?? {}),
          ...(searchResult.data_object?.metadata_fields ?? {}),
        },
      };
    });
  }

  public async upsertTag(
    tagSlug: string,
    metadata: SemanticVectorTagMetadata,
    options: SemanticVectorUpsertOptions = {},
  ): Promise<void> {
    const vector = await this.generateEmbedding(metadata.sourceText, options.traceId);
    const restrictedValues = buildVertexRestrictedValues(metadata.authority);

    const body = {
      data: {
        tagSlug,
        authority: metadata.authority,
        label: metadata.label,
        category: metadata.category,
        description: metadata.description,
        locale: metadata.locale,
        tags: metadata.tags ?? [],
        isActive: metadata.isActive ?? true,
      },
      vectors: {
        [this.vectorSearchField]: vector,
      },
      metadata: {
        traceId: options.traceId,
        embeddingModel: this.embeddingModel,
        restrictedValues,
      },
    };

    // Vertex Vector Search 2.0 data-object create/update uses POST with `?dataObjectId=...`.
    await this.authorizedFetch(
      this.buildVectorSearchUrl(`?dataObjectId=${encodeURIComponent(tagSlug)}`),
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      options.traceId,
      'vector-upsert',
    );
  }

  private async generateEmbedding(sourceText: string, traceId?: string): Promise<readonly number[]> {
    const response = await this.authorizedFetch(
      this.buildEmbeddingUrl(),
      {
        method: 'POST',
        body: JSON.stringify({
          instances: [
            {
              content: sourceText,
              task_type: 'RETRIEVAL_DOCUMENT',
            },
          ],
        }),
      },
      traceId,
      'embedding-generate',
    );

    const payload = await this.readJson<VertexEmbeddingPrediction>(response);
    const vector = payload.predictions?.[0]?.embeddings?.values ?? [];
    assertNonEmptyVector(vector, 'embedding');
    return vector;
  }

  private async authorizedFetch(
    url: string,
    init: RequestInit,
    traceId?: string,
    operation = 'vertex-request',
  ): Promise<Response> {
    const token = await this.config.getAccessToken();
    const response = await this.fetcher(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(traceId ? { 'x-trace-id': traceId } : {}),
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(
        `Vertex AI request failed [${operation}] ${url}: ${response.status} ${response.statusText}${responseBody ? ` :: ${responseBody}` : ''}`,
      );
    }

    return response;
  }

  private async readJson<T>(response: Response): Promise<T> {
    return response.json() as Promise<T>;
  }

  private buildEmbeddingUrl(): string {
    return `https://${this.config.location}-aiplatform.googleapis.com/v1/projects/${this.config.projectId}/locations/${this.config.location}/publishers/google/models/${this.embeddingModel}:predict`;
  }

  private buildVectorSearchUrl(suffix: string): string {
    return `https://vectorsearch.googleapis.com/v1beta/projects/${this.config.projectId}/locations/${this.config.location}/collections/${this.config.collectionId}/dataObjects${suffix}`;
  }

  private static resolveDefaultFetch(): FetchLike {
    if (typeof globalThis.fetch !== 'function') {
      throw new Error('VertexAIAdapter requires a fetch implementation.');
    }

    return globalThis.fetch.bind(globalThis);
  }
}
