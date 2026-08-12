import { CompressError, DecompressError, NormalizeError } from './errors';

export type CompressAlgorithm = 'gzip' | 'deflate' | 'deflate-raw';
export type CompressorInput = string | ArrayBuffer | Uint8Array | Blob;

/**
 * Class for compressing and decompressing data using the native Compression
 * Streams API. Supports gzip, deflate and deflate-raw.
 *
 * @example
 * const compressor = new Compressor('gzip');
 * const compressed = await compressor.compress('hello world');
 * const text = await compressor.decompress(compressed, true);
 */
export class Compressor<T extends CompressAlgorithm = CompressAlgorithm> {
  /**
   * @param algorithm Compression algorithm to use for this instance.
   */
  constructor(public algorithm: T) {}

  /**
   * Converts any supported input type into a `Uint8Array` so it can be
   * fed into the compression/decompression streams.
   *
   * @param buffer Input to normalize. Accepts `string`, `ArrayBuffer`,
   * `Uint8Array` or `Blob`.
   * @returns The input as a `Uint8Array`.
   */
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

  /**
   * Compresses the given input using this instance's algorithm.
   *
   * @param buffer Data to compress. Accepts `string`, `ArrayBuffer`,
   * `Uint8Array` or `Blob`.
   * @returns The compressed data as a `Uint8Array`.
   */
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

  //
  // OVERLOADS
  //

  /**
   * @param buffer Compressed data to decompress. Accepts `string`,
   * `ArrayBuffer`, `Uint8Array` or `Blob`.
   * @param asText Whether to decode the result as text. Pass `true` to
   * get a `string` back.
   * @returns The decompressed data as a `string`.
   */
  public async decompress(
    buffer: CompressorInput,
    asText: true,
  ): Promise<string>;

  /**
   * @param buffer Compressed data to decompress. Accepts `string`,
   * `ArrayBuffer`, `Uint8Array` or `Blob`.
   * @param asText Whether to decode the result as text. Defaults to
   * `false`, returning raw bytes.
   * @returns The decompressed data as a `Uint8Array`.
   */
  public async decompress(
    buffer: CompressorInput,
    asText?: false,
  ): Promise<Uint8Array>;

  //
  // Implementation
  //

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
