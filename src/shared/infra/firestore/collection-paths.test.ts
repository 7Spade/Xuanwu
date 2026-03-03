import { describe, it, expect } from 'vitest';

import { SUBCOLLECTIONS } from './collection-paths';

describe('SUBCOLLECTIONS path contracts', () => {
  it('uses camelCase ParsingIntent path to match VS5 repositories and queries', () => {
    expect(SUBCOLLECTIONS.parsingIntents).toBe('parsingIntents');
  });
});
