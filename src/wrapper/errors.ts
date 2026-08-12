// errors.ts

/**
 * Base error class for all errors thrown by this library. Every specific
 * error extends this class so consumers can catch `CompressEdgeError` to
 * handle any failure from the package in one place.
 *
 * @example
 * try {
 *   await compressor.compress(data);
 * } catch (err) {
 *   if (err instanceof CompressEdgeError) {
 *     console.error(err.name, err.cause);
 *   }
 * }
 */
export class CompressEdgeError extends Error {
  /**
   * @param message Human-readable error message.
   * @param options Standard `ErrorOptions`, typically used to pass the
   * original `cause`.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'CompressEdgeError';
  }
}

/**
 * Thrown when compression fails, wrapping the underlying stream error.
 */
export class CompressError extends CompressEdgeError {
  /**
   * @param cause The original error thrown by the compression stream.
   */
  constructor(cause: unknown) {
    super('Compression failed', { cause });
    this.name = 'CompressError';
  }
}

/**
 * Thrown when decompression fails, wrapping the underlying stream error.
 */
export class DecompressError extends CompressEdgeError {
  /**
   * @param cause The original error thrown by the decompression stream.
   */
  constructor(cause: unknown) {
    super('Decompression failed', { cause });
    this.name = 'DecompressError';
  }
}

/**
 * Thrown when an input value cannot be normalized into a `Uint8Array`,
 * typically due to an unsupported input type.
 */
export class NormalizeError extends CompressEdgeError {
  /**
   * @param cause The original error thrown during normalization.
   */
  constructor(cause: unknown) {
    super('Failed to normalize input', { cause });
    this.name = 'NormalizeError';
  }
}
