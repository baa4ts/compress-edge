# compress-edge

Lightweight, safe and fully typed wrapper over the Compression Streams API for compressing and decompressing data with gzip, deflate and deflate-raw. Designed for Edge environments (Cloudflare Workers, Vercel Edge) and the browser.

[![Socket Badge](https://badge.socket.dev/npm/package/compress-edge)](https://badge.socket.dev/npm/package/compress-edge)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/baa4ts/compress-edge)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Rslib](https://img.shields.io/badge/Rslib-07C160?style=flat&logo=rsbuild&logoColor=white)](https://rslib.rs/)
[![Rstest](https://img.shields.io/badge/Rstest-00A8FF?style=flat&logo=rspack&logoColor=white)](https://rstest.rs/)

- [Compression Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API)
- [Documentation - DeepWiki](https://deepwiki.com/baa4ts/compress-edge)
- [Getting Started - DeepWiki](https://deepwiki.com/baa4ts/compress-edge/1.1-getting-started)

## Features

- ✅ **Zero dependencies**: Uses the native browser/runtime API.
- ✅ **Type-safe**: TypeScript overloads to infer whether `decompress` returns `string` or `Uint8Array`.
- ✅ **Multi-input**: Natively accepts `string`, `Uint8Array`, `ArrayBuffer` and `Blob`.
- ✅ **Memory-safe**: Safe handling of `Uint8Array` (partial offsets) and prevention of memory leaks in the streams.
- ✅ **Robust error handling**: Custom errors with a hierarchy that preserves the original cause (`cause`).

### Status

| Implementation | Status |
| --------------- | ------ |
| Compress         | ✓      |
| Decompress       | ✓      |
| Custom Errors    | ✓      |

## Installation

```bash
npm install compress-edge
# or
pnpm add compress-edge
# or
yarn add compress-edge
```

## Basic usage

### Compressing and decompressing a string

```typescript
import { Compressor } from 'compress-edge';

const gz = new Compressor('gzip');

const compressed = await gz.compress('hello world repeated repeated repeated');
const original = await gz.decompress(compressed, true);

console.log(original); // 'hello world repeated repeated repeated'
```

### Working with Uint8Array or ArrayBuffer

```typescript
import { Compressor } from 'compress-edge';

const gz = new Compressor('deflate');

const bytes = new TextEncoder().encode('raw data');
const compressed = await gz.compress(bytes);
const decompressed = await gz.decompress(compressed);

console.log(new TextDecoder().decode(decompressed)); // 'raw data'
```

### Working with Blob (files)

```typescript
import { Compressor } from 'compress-edge';

const gz = new Compressor('gzip');

const file = new Blob(['contents of a text file']);
const compressed = await gz.compress(file);
const text = await gz.decompress(compressed, true);

console.log(text); // 'contents of a text file'
```

## Error handling

The library provides a hierarchy of custom errors that extend `CompressEdgeError`. Every error preserves the original cause using JavaScript's standard `cause` property.

```typescript
import { Compressor, CompressError, DecompressError, NormalizeError } from 'compress-edge';

const gz = new Compressor('gzip');

try {
  // Attempt to decompress invalid data
  await gz.decompress(new Uint8Array([1, 2, 3]));
} catch (err) {
  if (err instanceof DecompressError) {
    console.error('Decompression failed:', err.message);
    console.error('Original cause:', err.cause); // Native stream error
  }
}
```

### Error hierarchy

- **`CompressEdgeError`**: Base class for all errors in the library.
  - **`NormalizeError`**: Thrown when the provided input is not a valid type (`string`, `Uint8Array`, `ArrayBuffer`, `Blob`).
  - **`CompressError`**: Thrown when the compression process fails.
  - **`DecompressError`**: Thrown when the decompression process fails (e.g. corrupted data).

## API

### Compressor

`new Compressor(algorithm: 'gzip' | 'deflate' | 'deflate-raw')`

- `compress(buffer: CompressorInput): Promise<Uint8Array>` — compresses the input and returns the compressed bytes.
- `decompress(buffer: CompressorInput): Promise<Uint8Array>` — decompresses the input and returns the original bytes.
- `decompress(buffer: CompressorInput, asText: true): Promise<string>` — decompresses the input and returns the decoded original text.

*Note: `CompressorInput` is a type alias for `string | ArrayBuffer | Uint8Array | Blob`.*

## Supported algorithms

| Algorithm    | Description                                    |
| ------------ | ----------------------------------------------- |
| gzip         | Standard gzip format, includes headers and checksum |
| deflate      | Deflate format with zlib header                 |
| deflate-raw  | Deflate format without header, more lightweight  |