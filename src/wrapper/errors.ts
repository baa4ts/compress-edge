// errors.ts
export class CompressEdgeError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'CompressEdgeError';
  }
}

export class CompressError extends CompressEdgeError {
  constructor(cause: unknown) {
    super('Compression failed', { cause });
    this.name = 'CompressError';
  }
}

export class DecompressError extends CompressEdgeError {
  constructor(cause: unknown) {
    super('Decompression failed', { cause });
    this.name = 'DecompressError';
  }
}

export class NormalizeError extends CompressEdgeError {
  constructor(cause: unknown) {
    super('Failed to normalize input', { cause });
    this.name = 'NormalizeError';
  }
}
