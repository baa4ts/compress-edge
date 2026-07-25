import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2022',
      bundle: true,
      dts: true,
    },
    {
      format: 'cjs',
      syntax: 'es2022',
      bundle: true,
      dts: true,
    },
  ],
  output: {
    target: 'web',
  },
});