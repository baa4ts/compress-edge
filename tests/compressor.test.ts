import { expect, test } from '@rstest/core';
import { Compressor } from '../src/index';

const algorithms = ['gzip', 'deflate', 'deflate-raw'] as const;

for (const algo of algorithms) {
  test(`${algo}: round-trip con string`, async () => {
    const cmp = new Compressor(algo);
    const original = 'hola mundo repetido repetido repetido';

    const comprimido = await cmp.compress(original);
    const descomprimido = await cmp.decompress(comprimido, true);

    expect(descomprimido).toBe(original);
  });

  test(`${algo}: comprime reduce el tamaño en input repetitivo`, async () => {
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
