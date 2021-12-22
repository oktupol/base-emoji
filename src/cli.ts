#!/usr/bin/env node

import { Command } from 'commander';
import { accessSync, constants, readFileSync, statSync } from 'fs';
import { BaseEmoji } from './lib/base-emoji';

const program = new Command();
program.version('1.0.0');

program
  .description('Base-Emoji encode or decode FILE, or standard input, to standard output.\n\nWith no FILE, or when FILE is -, read standard input.')
  .usage('base-emoji [OPTION]... [FILE]')
  .argument('[file]', 'File to encode/decode')
  .option('-d, --decode', 'Decode base-emoji encoded data')
  .option('-a, --armor', 'base-emoji encode and armor data')
  .option('--descriptor [descriptor]', 'When encoding and armoring, optionally specify a description for the armor header and footer')
  .option('-i, --ignore-garbage', 'when decoding, ignore non-emoji characters')
  .option('-w, --wrap <cols>', 'wrap encoded lines after <cols> characters. Use 0 to disable line wrapping', '32')
  .action((file: string | undefined) => {
    const decode: boolean = !!program.getOptionValue('decode');
    const descriptor: string | undefined = program.getOptionValue('descriptor');
    const wrap: number = Math.max(0, Number(program.getOptionValue('wrap')));
    const armor: boolean = !!program.getOptionValue('armor') && wrap > 0;

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
      result = BaseEmoji.decode(buffer.toString(), { format: 'binary' }) as Uint8Array;
    } else {
      result = BaseEmoji.encode(buffer, { armor, wrap, armorDescriptor: descriptor }) + '\n';
    }
    
    process.stdout.write(result);
  });

program.parse(process.argv);