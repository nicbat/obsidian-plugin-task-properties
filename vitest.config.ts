import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  test: {
    // `obsidian` is types-only at runtime; point it at a small stub so the pure
    // helpers in src/ can be unit-tested in plain Node.
    alias: {
      obsidian: path.resolve(__dirname, 'test/obsidian-stub.ts'),
    },
  },
});
