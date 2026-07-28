import { expect, test } from '@rstest/core';
import { Compressor } from '../src/index';
import {
  CompressEdgeError,
  CompressError,
  DecompressError,
  NormalizeError,
} from '../src/index';

const algorithms = ['gzip', 'deflate', 'deflate-raw'] as const;

for (const algo of algorithms) {
  test(`${algo}: round-trip con string`, async () => {
    const cmp = new Compressor(algo);
    const original = 'hola mundo repetido repetido repetido';

    const comprimido = await cmp.compress(original);
    const descomprimido = await cmp.decompress(comprimido, true);

    expect(descomprimido).toBe(original);
  });

  test(`${algo}: comprime reduce el tamano en input repetitivo`, async () => {
    const cmp = new Compressor(algo);
    const original = 'a'.repeat(1000);

    const comprimido = await cmp.compress(original);
    const originalBytes = new TextEncoder().encode(original);

    expect(comprimido.length).toBeLessThan(originalBytes.length);
  });

  test(`${algo}: round-trip con Uint8Array`, async () => {
    const cmp = new Compressor(algo);
    const original = new TextEncoder().encode('bytes crudos de prueba');

    const comprimido = await cmp.compress(original);
    const descomprimido = await cmp.decompress(comprimido);

    expect(descomprimido).toEqual(original);
  });

  test(`${algo}: round-trip con ArrayBuffer`, async () => {
    const cmp = new Compressor(algo);
    const original = new TextEncoder().encode('desde array buffer').buffer;

    const comprimido = await cmp.compress(original);
    const descomprimido = await cmp.decompress(comprimido, true);

    expect(descomprimido).toBe('desde array buffer');
  });

  test(`${algo}: round-trip con Blob`, async () => {
    const cmp = new Compressor(algo);
    const original = new Blob(['contenido de un blob de prueba']);

    const comprimido = await cmp.compress(original);
    const descomprimido = await cmp.decompress(comprimido, true);

    expect(descomprimido).toBe('contenido de un blob de prueba');
  });

  test(`${algo}: decompress sin asText devuelve Uint8Array`, async () => {
    const cmp = new Compressor(algo);
    const original = 'chequeo de tipo de retorno';

    const comprimido = await cmp.compress(original);
    const descomprimido = await cmp.decompress(comprimido);

    expect(descomprimido).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(descomprimido)).toBe(original);
  });

  test(`${algo}: string vacio no rompe`, async () => {
    const cmp = new Compressor(algo);
    const comprimido = await cmp.compress('');
    const descomprimido = await cmp.decompress(comprimido, true);

    expect(descomprimido).toBe('');
  });

  test(`${algo}: instancia reutilizable para multiples llamadas`, async () => {
    const cmp = new Compressor(algo);

    const primero = await cmp.compress('primer mensaje');
    const segundo = await cmp.compress('segundo mensaje');

    expect(await cmp.decompress(primero, true)).toBe('primer mensaje');
    expect(await cmp.decompress(segundo, true)).toBe('segundo mensaje');
  });
}

test('algoritmos distintos producen salidas distintas para el mismo input', async () => {
  const input = 'texto de comparacion entre algoritmos';

  const gzip = await new Compressor('gzip').compress(input);
  const deflate = await new Compressor('deflate').compress(input);
  const deflateRaw = await new Compressor('deflate-raw').compress(input);

  expect(gzip).not.toEqual(deflate);
  expect(deflate).not.toEqual(deflateRaw);
});

for (const algo of algorithms) {
  test(`${algo}: decompress de datos no comprimidos lanza DecompressError`, async () => {
    const cmp = new Compressor(algo);
    const raw = new TextEncoder().encode('esto no esta comprimido');

    await expect(cmp.decompress(raw)).rejects.toBeInstanceOf(DecompressError);
  });

  test(`${algo}: DecompressError es instancia de CompressEdgeError`, async () => {
    const cmp = new Compressor(algo);
    const raw = new TextEncoder().encode('datos invalidos');

    await expect(cmp.decompress(raw)).rejects.toBeInstanceOf(CompressEdgeError);
  });

  test(`${algo}: DecompressError preserva cause`, async () => {
    const cmp = new Compressor(algo);
    const raw = new TextEncoder().encode('datos invalidos');

    try {
      await cmp.decompress(raw);
    } catch (err) {
      expect(err).toBeInstanceOf(DecompressError);
      expect((err as DecompressError).cause).toBeDefined();
    }
  });

  test(`${algo}: round-trip con Uint8Array parcial (slice/offset)`, async () => {
    const cmp = new Compressor(algo);
    const bigBuffer = new ArrayBuffer(100);
    const fullView = new Uint8Array(bigBuffer);

    const mensaje = 'datos en el medio';
    const encoded = new TextEncoder().encode(mensaje);
    fullView.set(encoded, 50);

    const vistaParcial = new Uint8Array(bigBuffer, 50, encoded.length);

    const comprimido = await cmp.compress(vistaParcial);
    const descomprimido = await cmp.decompress(comprimido, true);

    expect(descomprimido).toBe(mensaje);
  });

  test(`${algo}: round-trip con datos binarios aleatorios`, async () => {
    const cmp = new Compressor(algo);
    const original = new Uint8Array(1024); // 1KB de datos aleatorios
    crypto.getRandomValues(original);

    const comprimido = await cmp.compress(original);
    const descomprimido = await cmp.decompress(comprimido);

    expect(descomprimido).toEqual(original);
  });
}

test('compress con algoritmo invalido lanza CompressError', async () => {
  // @ts-expect-error — algoritmo invalido a proposito
  const cmp = new Compressor('algo-inexistente');

  await expect(cmp.compress('texto')).rejects.toBeInstanceOf(CompressError);
});

test('input invalido en compress lanza NormalizeError', async () => {
  const cmp = new Compressor('gzip');

  // @ts-expect-error — tipo invalido a proposito
  await expect(cmp.compress(12345)).rejects.toBeInstanceOf(NormalizeError);
});

test('NormalizeError es instancia de CompressEdgeError', async () => {
  const cmp = new Compressor('gzip');

  // @ts-expect-error — tipo invalido a proposito
  await expect(cmp.compress(12345)).rejects.toBeInstanceOf(CompressEdgeError);
});

test('error.name es correcto en cada clase', async () => {
  const cmp = new Compressor('gzip');
  const raw = new TextEncoder().encode('invalido');

  try {
    await cmp.decompress(raw);
  } catch (err) {
    expect((err as Error).name).toBe('DecompressError');
  }

  try {
    // @ts-expect-error — tipo invalido a proposito
    await cmp.compress(12345);
  } catch (err) {
    expect((err as Error).name).toBe('NormalizeError');
  }
});

test('input null lanza NormalizeError', async () => {
  const cmp = new Compressor('gzip');
  // @ts-expect-error — probando runtime
  await expect(cmp.compress(null)).rejects.toBeInstanceOf(NormalizeError);
});

test('input undefined lanza NormalizeError', async () => {
  const cmp = new Compressor('gzip');
  // @ts-expect-error — probando runtime
  await expect(cmp.compress(undefined)).rejects.toBeInstanceOf(NormalizeError);
});
