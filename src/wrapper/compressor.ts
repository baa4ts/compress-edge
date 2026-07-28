import { CompressError, DecompressError, NormalizeError } from './errors';

export type CompressAlgorithm = 'gzip' | 'deflate' | 'deflate-raw';
export type CompressorInput = string | ArrayBuffer | Uint8Array | Blob;

export class Compressor<T extends CompressAlgorithm = CompressAlgorithm> {
  constructor(public algorithm: T) {}

  private async normalize(
    buffer: CompressorInput,
  ): Promise<Uint8Array<ArrayBuffer>> {
    try {
      if (typeof buffer === 'string') {
        return new TextEncoder().encode(buffer);
      }
      if (buffer instanceof Blob) {
        return new Uint8Array(await buffer.arrayBuffer());
      }
      if (buffer instanceof ArrayBuffer) {
        return new Uint8Array(buffer);
      }
      if (buffer instanceof Uint8Array) {
        return buffer.slice();
      }
      throw new Error(`Unsupported input type: ${typeof buffer}`);
    } catch (err) {
      throw new NormalizeError(err);
    }
  }

  public async compress(buffer: CompressorInput): Promise<Uint8Array> {
    try {
      const datos = await this.normalize(buffer);
      const cmp = new CompressionStream(this.algorithm);
      const writer = cmp.writable.getWriter();

      try {
        await writer.write(datos);
        await writer.close();
      } catch (error) {
        await writer.abort(error);
        throw error;
      }
      return new Uint8Array(await new Response(cmp.readable).arrayBuffer());
    } catch (err) {
      if (err instanceof NormalizeError) throw err;
      throw new CompressError(err);
    }
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
    try {
      const datos = await this.normalize(buffer);
      const dcmp = new DecompressionStream(this.algorithm);
      const writer = dcmp.writable.getWriter();

      try {
        await writer.write(datos);
        await writer.close();
      } catch (error) {
        await writer.abort(error);
        throw error;
      }
      const resultado = new Uint8Array(
        await new Response(dcmp.readable).arrayBuffer(),
      );
      return asText ? new TextDecoder().decode(resultado) : resultado;
    } catch (err) {
      if (err instanceof NormalizeError) throw err;
      throw new DecompressError(err);
    }
  }
}
