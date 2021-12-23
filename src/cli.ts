#!/usr/bin/env node

import { Command } from 'commander';
import { accessSync, constants, readFileSync, statSync } from 'fs';
import { BaseEmoji } from './lib/base-emoji';
import { emojiDecodeMap } from './lib/emojis';

const program = new Command();
program.version('1.0.1');

program
  .description('Base-Emoji encode or decode FILE, or standard input, to standard output.\n\nWith no FILE, or when FILE is -, read standard input.')
  .usage('base-emoji [OPTION]... [FILE]')
  .argument('[file]', 'File to encode/decode')
  .option('-a, --armor', 'base-emoji encode and armor data')
  .option('-l, --descriptor [descriptor]', 'When encoding and armoring, optionally specify a description for the armor header and footer')
  .option('-d, --decode', 'Decode base-emoji encoded data')
  .option('-i, --ignore-garbage', 'when decoding, ignore non-emoji characters')
  .option('-w, --wrap <cols>', 'wrap encoded lines after <cols> characters. Use 0 to disable line wrapping', '32')
  .option('--list-emojis', 'Output a list of all 1024 emojis used for encoding and decoding base-emoji')
  .action((file: string | undefined) => {
    const wrap: number = Math.max(0, Number(program.getOptionValue('wrap')));
    const armor: boolean = !!program.getOptionValue('armor') && wrap > 0;
    const descriptor: string | undefined = program.getOptionValue('descriptor');
    const decode: boolean = !!program.getOptionValue('decode');
    const ignoreGarbage: boolean = !!program.getOptionValue('ignoreGarbage');
    const listEmojis: boolean = !!program.getOptionValue('listEmojis');

    if (listEmojis) {
      console.log(JSON.stringify(emojiDecodeMap, undefined, 2) + '\n')
      return;
    }

    let buffer: Buffer;
    
    if (file && file !== '-') { 
      try {
        accessSync(file, constants.R_OK);
        
        if (statSync(file).isDirectory()) {
          throw new Error('Cannot open directories');
        }
      } catch (err) {
        console.error(`Cannot open ${file} for reading`);
        process.exit(1);
      }
      
      buffer = readFileSync(file);
    } else {
      buffer = readFileSync(0);
    }
    
    let result: string | Uint8Array;
    if (decode) {
      result = BaseEmoji.decode(buffer.toString(), { format: 'binary', ignoreGarbage }) as Uint8Array;
    } else {
      result = BaseEmoji.encode(buffer, { armor, wrap, armorDescriptor: descriptor }) + '\n';
    }
    
    process.stdout.write(result);
  });

program.parse(process.argv);