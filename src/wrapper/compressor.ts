export type CompressAlgorithm = 'gzip' | 'deflate' | 'deflate-raw';
export type CompressorInput = string | ArrayBuffer | Uint8Array | Blob;

export class Compressor<T extends CompressAlgorithm = CompressAlgorithm> {
  constructor(public algorithm: T) {}

  private async normalize(
    buffer: CompressorInput,
  ): Promise<Uint8Array<ArrayBuffer>> {
    if (typeof buffer === 'string') {
      return new Uint8Array(new TextEncoder().encode(buffer));
    }
    if (buffer instanceof Blob) {
      return new Uint8Array(await buffer.arrayBuffer());
    }
    if (buffer instanceof ArrayBuffer) {
      return new Uint8Array(buffer);
    }
    return new Uint8Array(buffer.buffer as ArrayBuffer);
  }

  public async compress(buffer: CompressorInput): Promise<Uint8Array> {
    const datos = await this.normalize(buffer);
    const cmp = new CompressionStream(this.algorithm);

    const writer = cmp.writable.getWriter();
    await writer.write(datos);
    await writer.close();

    const resultado = new Uint8Array(
      await new Response(cmp.readable).arrayBuffer(),
    );
    return resultado;
  }

  public async decompress(
    buffer: CompressorInput,
    asText: true,
  ): Promise<string>;
  public async decompress(
    buffer: CompressorInput,
    asText?: false,
  ): Promise<Uint8Array>;

  public async decompress(
    buffer: CompressorInput,
    asText = false,
  ): Promise<string | Uint8Array> {
    const datos = await this.normalize(buffer);
    const dcmp = new DecompressionStream(this.algorithm);

    const writer = dcmp.writable.getWriter();
    await writer.write(datos);
    await writer.close();

    const resultado = new Uint8Array(
      await new Response(dcmp.readable).arrayBuffer(),
    );
    return asText ? new TextDecoder().decode(resultado) : resultado;
  }
}
