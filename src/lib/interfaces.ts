export interface EncodeOptions {
  armor?: boolean;
  armorDescriptor?: string;
  wrap?: number;
};

export interface DecodeOptions {
  format?: 'string' | 'binary';
  ignoreGarbage?: boolean;
}