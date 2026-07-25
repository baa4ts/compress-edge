# compress-edge

Wrapper ligero sobre la [Compression Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API) para comprimir y descomprimir datos con gzip, deflate y deflate-raw.

[![Socket Badge](https://badge.socket.dev/npm/package/compress-edge/1.0.0)](https://badge.socket.dev/npm/package/compress-edge/1.0.0)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/baa4ts/compress-edge)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Rslib](https://img.shields.io/badge/Rslib-07C160?style=flat&logo=rsbuild&logoColor=white)](https://rslib.rs/)
[![Rstest](https://img.shields.io/badge/Rstest-00A8FF?style=flat&logo=rspack&logoColor=white)](https://rstest.rs/)

- [Documentacion - DeepWiki](https://deepwiki.com/baa4ts/compress-edge)
- [Primeros Pasos - DeepWiki](https://deepwiki.com/baa4ts/compress-edge/1.1-getting-started)


## Referencias

- [Compression Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API)

### Status

| Implementacion | Estado |
| --------------- | ------ |
| Compress         | ✓      |
| Decompress       | ✓      |

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

## API

### Compressor

`new Compressor(algorithm: 'gzip' | 'deflate' | 'deflate-raw')`

- `compress(buffer: string | ArrayBuffer | Uint8Array | Blob): Promise<Uint8Array>` — comprime el input y devuelve los bytes comprimidos.
- `decompress(buffer: string | ArrayBuffer | Uint8Array | Blob): Promise<Uint8Array>` — descomprime el input y devuelve los bytes originales.
- `decompress(buffer: string | ArrayBuffer | Uint8Array | Blob, asText: true): Promise<string>` — descomprime el input y devuelve el texto original decodificado.

## Algoritmos soportados

| Algoritmo    | Descripcion                                      |
| ------------ | ------------------------------------------------- |
| gzip         | Formato gzip estandar, incluye headers y checksum |
| deflate      | Formato deflate con header zlib                   |
| deflate-raw  | Formato deflate sin header, mas liviano           |

## Licencia

BSD-3-Clause