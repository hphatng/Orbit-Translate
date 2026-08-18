import { describe, it, expect, vi } from 'vitest';
import { translateWithGoogle } from '@/lib/translator';

describe('Google Translate Service', () => {
  it('returns empty string on empty input', async () => {
    const result = await translateWithGoogle('');
    expect(result).toBe('');
  });

  it('translates text accurately using Google Translate API', async () => {
    const text = 'Hello world! Welcome to Orbit Translate.';
    const result = await translateWithGoogle(text, 'vi', 'en');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});
