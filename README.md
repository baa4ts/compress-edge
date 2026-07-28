# compress-edge

Wrapper ligero, seguro y tipado sobre la [Compression Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API) para comprimir y descomprimir datos con gzip, deflate y deflate-raw. Disenado para entornos Edge (Cloudflare Workers, Vercel Edge) y el navegador.

[![Socket Badge](https://badge.socket.dev/npm/package/compress-edge/1.0.0)](https://badge.socket.dev/npm/package/compress-edge/1.0.0)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/baa4ts/compress-edge)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Rslib](https://img.shields.io/badge/Rslib-07C160?style=flat&logo=rsbuild&logoColor=white)](https://rslib.rs/)
[![Rstest](https://img.shields.io/badge/Rstest-00A8FF?style=flat&logo=rspack&logoColor=white)](https://rstest.rs/)

- [Documentacion - DeepWiki](https://deepwiki.com/baa4ts/compress-edge)
- [Primeros Pasos - DeepWiki](https://deepwiki.com/baa4ts/compress-edge/1.1-getting-started)

## Caracteristicas

- ✅ **Zero dependencies**: Usa la API nativa del navegador/Runtime.
- ✅ **Tipado seguro**: Sobrecargas en TypeScript para inferir si `decompress` devuelve `string` o `Uint8Array`.
- ✅ **Multi-input**: Acepta `string`, `Uint8Array`, `ArrayBuffer` y `Blob` de forma nativa.
- ✅ **Memory-safe**: Manejo seguro de `Uint8Array` (offsets parciales) y prevencion de fugas de memoria (memory leaks) en los streams.
- ✅ **Manejo de errores robusto**: Errores personalizados con jerarquia que preservan la causa original (`cause`).

## Referencias

- [Compression Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API)

### Status

| Implementacion | Estado |
| --------------- | ------ |
| Compress         | ✓      |
| Decompress       | ✓      |
| Custom Errors    | ✓      |

## Instalacion

```bash
npm install compress-edge
# o
pnpm add compress-edge
# o
yarn add compress-edge
```

## Uso basico

### Comprimir y descomprimir un string

```typescript
import { Compressor } from 'compress-edge';

const gz = new Compressor('gzip');

const comprimido = await gz.compress('hola mundo repetido repetido repetido');
const original = await gz.decompress(comprimido, true);

console.log(original); // 'hola mundo repetido repetido repetido'
```

### Trabajar con Uint8Array o ArrayBuffer

```typescript
import { Compressor } from 'compress-edge';

const gz = new Compressor('deflate');

const bytes = new TextEncoder().encode('datos crudos');
const comprimido = await gz.compress(bytes);
const descomprimido = await gz.decompress(comprimido);

console.log(new TextDecoder().decode(descomprimido)); // 'datos crudos'
```

### Trabajar con Blob (archivos)

```typescript
import { Compressor } from 'compress-edge';

const gz = new Compressor('gzip');

const archivo = new Blob(['contenido de un archivo de texto']);
const comprimido = await gz.compress(archivo);
const texto = await gz.decompress(comprimido, true);

console.log(texto); // 'contenido de un archivo de texto'
```

## Manejo de Errores

La libreria proporciona una jerarquia de errores personalizados que se extienden de `CompressEdgeError`. Todos los errores preservan la causa original usando la propiedad estandar `cause` de JavaScript.

```typescript
import { Compressor, CompressError, DecompressError, NormalizeError } from 'compress-edge';

const gz = new Compressor('gzip');

try {
  // Intentar descomprimir datos invalidos
  await gz.decompress(new Uint8Array([1, 2, 3]));
} catch (err) {
  if (err instanceof DecompressError) {
    console.error('La descompresion fallo:', err.message);
    console.error('Causa original:', err.cause); // Error nativo del stream
  }
}
```

### Jerarquia de Errores

- **`CompressEdgeError`**: Clase base para todos los errores de la libreria.
  - **`NormalizeError`**: Lanzado cuando el input proporcionado no es un tipo valido (`string`, `Uint8Array`, `ArrayBuffer`, `Blob`).
  - **`CompressError`**: Lanzado cuando falla el proceso de compresion.
  - **`DecompressError`**: Lanzado cuando falla el proceso de descompresion (ej. datos corruptos).

## API

### Compressor

`new Compressor(algorithm: 'gzip' | 'deflate' | 'deflate-raw')`

- `compress(buffer: CompressorInput): Promise<Uint8Array>` — comprime el input y devuelve los bytes comprimidos.
- `decompress(buffer: CompressorInput): Promise<Uint8Array>` — descomprime el input y devuelve los bytes originales.
- `decompress(buffer: CompressorInput, asText: true): Promise<string>` — descomprime el input y devuelve el texto original decodificado.

*Nota: `CompressorInput` es un tipo alias para `string | ArrayBuffer | Uint8Array | Blob`.*

## Algoritmos soportados

| Algoritmo    | Descripcion                                      |
| ------------ | ------------------------------------------------- |
| gzip         | Formato gzip estandar, incluye headers y checksum |
| deflate      | Formato deflate con header zlib                   |
| deflate-raw  | Formato deflate sin header, mas liviano           |