import { resourceLimits } from 'worker_threads';
import { emojiDecodeMap, emojis, specialEmojis } from './emojis';
import { DecodeOptions, EncodeOptions } from './interfaces';

/**
 * The main BaseEmoji class
 * 
 * @author Sebastian Wieland
 * @copyright 2021
 * @license MIT
 * 
 * @typedef {{armor?: boolean, armorDescriptor?: string, wrap?: number}} EncodeOptions
 * @typedef {{format?: string, ignoreGarbage?: boolean}} DecodeOptions
 */
export class BaseEmoji {
  /**
   * Encode data into base-emoji
   * 
   * @param {string | ArrayBufferLike} buffer Data to be encoded, either as string or ArrayBufferLike (e.g. Uint8Array, ArrayBuffer ...)
   * @param {EncodeOptions} options Optional object with options for encoding. These are:
   *                                - armor: boolean; if true, the result will be armored with an easy-to-recognise header and a footer
   *                                - armorDescriptor: string; if armored, the descriptor will be displayed inside the armor header and footer
   *                                - wrap: number; a new line will be inserted every n characters, if specified
   * @returns {string} The base-emoji encoded representation of the data
   */
  public static encode(buffer: string | ArrayBufferLike, options: EncodeOptions = {}): string {
    const bytes = this.toUint8Array(buffer);
    
    if (!bytes.length) {
      return '';
    }
    
    const { transposed, remainder, bitsRemaining } = this.transpose(bytes, 8, 10);
    
    if (bitsRemaining > 0) {
      transposed.push(remainder);
    }
    
    const emojiRepresentation = transposed.map(i => emojis[i]);
    
    if (bitsRemaining > 0) {
      emojiRepresentation.push(specialEmojis.padding[10 - bitsRemaining]);
    }
    
    const emojiString = emojiRepresentation.join('');
    
    if (options.armor) {
      return this.armor(emojiString, options.armorDescriptor, options.wrap);
    } else if (options.wrap) {
      return this.wrap(emojiString, options.wrap);
    }
    
    return emojiString;
  }
  
  /**
   * Decode base-emoji into its original data
   * 
   * @param {string} encoded The base-emoji encoded data
   * @param {DecodeOptions} options Optional object with options for decoding. These are:
   *                                - format: either 'string' or 'binary'. If 'string', the return value will be a string. If 'binary', the return value will be an Uint8Array
   *                                - ignoreGarbage: If true, non-emoji characters in the input will be silently ignored. Otherwise, any non-emoji characters cause an error.
   * @returns {string | Uint8Array} The decoded data.
   */
  public static decode(encoded: string, options: DecodeOptions = {}): string | Uint8Array {
    encoded = encoded.trim();
    let encodedChars = this.dearmor(encoded);
    
    let padding = 0;
    if (specialEmojis.padding.includes(encodedChars[encodedChars.length - 1])) {
      const paddingChar = encodedChars.pop();
      padding = specialEmojis.padding.findIndex(c => c === paddingChar);
    }

    if (options.ignoreGarbage) {
      encodedChars = encodedChars.filter(c => typeof emojiDecodeMap[c] === 'number');
    }
    const tuples = encodedChars.map(c => {
      if (typeof emojiDecodeMap[c] === 'number') {
        return emojiDecodeMap[c]
      } else {
        throw new Error('Invalid input, unexpected char ' + c.charCodeAt(0) + ': ' + c);
      }
    });
    
    const { transposed } = this.transpose(tuples, 10, 8);
    
    if (padding >= 8) {
      transposed.pop();
    }
    
    const format = options.format ?? 'string';
    switch(format) {
      case 'binary':
        return new Uint8Array(transposed);
      case 'string':
        return transposed.map(b => String.fromCharCode(b)).join('');
      default:
        throw new Error('Invalid format ' + options.format)
    }
  }
  
  /**
   * Transpose an array of binary m-tuples into an array of binary n-tuples.
   * The bit order of the tuples is preserved, no new bits are inserted and
   * none are removed. Concatenated, all m-tuples' bits are equal to all
   * n-tuple's bits.
   * 
   * Example: m = 5, n = 3
   *
   * m-tuples   (a  b  c  d  e)(f  g  h  i  j)(k  l  o  p  q)
   *                         are transformed into
   * n-tuples   (a  b  c)(d  e  f)(g  h  i)(j  k  l)(o  p  q)
   *
   * 
   * In case the n-tuples don't divide into the m-tuples, a remainder is
   * returned, as well as the amount of the m-tuples' bits remaining.
   * 
   * Example: m = 9, n = 5
   * 
   * m-tuples   (a  b  c  d  e  f  g  h  i)(j  k  l  o  p  q  r  s  t)
   * n-tuples   (a  b  c  d  e)(f  g  h  i  j)(k  l  o  p  q)
   * remainder                                               (r  s  t  0  0)
   * bits remaining                                           +--3--+
   *
   * Example: m = 4, n = 7
   * 
   * m-tuples   (a  b  c  d)(e  f  g  h)(i  j  k  l)
   * n-tuples   (a  b  c  d  e  f  g)
   * remainder                       (h  i  j  k  l  0  0)
   * bits remaining                   +-----5-----+
   *
   * 
   * All tuples are stored as numbers and left-padded with zeros.
   * 
   * @private
   * @param {number | Uint8Array} mTuples The m-tuples
   * @param {number} m 
   * @param {number} n 
   * @returns {{transposed: number[], remainder: number, bitsRemaining: number}}
   */
  private static transpose(mTuples: number[] | Uint8Array, m: number, n: number): { transposed: number[], remainder: number, bitsRemaining: number } {
    const nTuples: number[] = [];

    let nTuple = 0;
    let bitsFilled = 0;
    for (let mTuple of mTuples) {
      let bitsRemaining = m;

      while (bitsRemaining) {
        const bitsTaken = Math.min(n - bitsFilled, bitsRemaining);
        const mask = (2 ** bitsTaken - 1) << (bitsRemaining - bitsTaken);
        const bits = (mTuple & mask) >> (bitsRemaining - bitsTaken);
        const shift = n - bitsFilled - bitsTaken;
        nTuple |= bits << shift;
        bitsRemaining -= bitsTaken;
        bitsFilled += bitsTaken;
        if (bitsFilled === n) {
          nTuples.push(nTuple);
          bitsFilled = 0;
          nTuple = 0;
        }
      }
    }
    
    return {
      transposed: nTuples,
      remainder: nTuple,
      bitsRemaining: bitsFilled,
      // I know the name is confusing for there being another variable called bitsRemaining. 
      // The reason why this one is called bitsRemaining is because that's the amount of bits
      // in the m-tuples which weren't transposed into n-tuples. This value is equal to the
      // amount of bits filled in the remainder, but since the remainder is often discarded
      // depending on the situation, it serves more use cases to talk about the remaining bits
      // of the m-tuples.
    };
  }
  
  /**
   * @private
   */
  private static armor(emojiString: string, descriptor?: string, wrap?: number): string {
    const _wrap = wrap ?? 32;
    const _descriptor = (descriptor ?? specialEmojis.armor.descriptor).substring(0, 0.5 * _wrap - 2);

    const begin = _descriptor + specialEmojis.armor.beginChar;
    const end = _descriptor + specialEmojis.armor.endChar;
    
    const createBoundary = (descriptor: string) => 
      specialEmojis.armor.marker.repeat(Math.floor((_wrap - [...descriptor].length) / 2))
      + descriptor
      + specialEmojis.armor.marker.repeat(Math.ceil((_wrap - [...descriptor].length) / 2));
    
    const firstLine = createBoundary(begin);
    
    const lastLine = createBoundary(end);
    
    return [ firstLine, this.wrap(emojiString, _wrap), lastLine ].join('\n');
  }
  
  /**
   * @private
   */
  private static dearmor(armored: string): string[] {
    const pattern = new RegExp(`^(${specialEmojis.armor.marker}*)(.*?)${specialEmojis.armor.beginChar}\\1${specialEmojis.armor.marker}?\\n((.|\\n)*?)\\1\\2${specialEmojis.armor.endChar}\\1${specialEmojis.armor.marker}?$`, 'gu');
    const armorless = armored.replace(pattern, '$3');
    
    return [...armorless].filter(c => c !== '\n');
  }
  
  /**
   * @private
   */
  private static wrap(emojiString: String, wrap: number): string {
    return emojiString.replace(new RegExp(`(.{${wrap}})(?!$)`, 'gmu'), '$1\n');
  }
  
  /**
   * @private
   */
  private static toUint8Array(buffer: string | Uint8Array | ArrayBuffer): Uint8Array {
    if (buffer instanceof Uint8Array || buffer instanceof ArrayBuffer) {
      return new Uint8Array(buffer);
    }
    
    const result = new Uint8Array(buffer.length);

    for (let i = 0; i < buffer.length; i++) {
      result[i] = buffer.charCodeAt(i);
    }
    
    return result;
  }
}