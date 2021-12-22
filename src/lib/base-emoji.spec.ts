import { BaseEmoji } from '..';
import { specialEmojis } from './emojis';
import crypto from 'crypto';

describe('BaseEmoji', () => {
  describe('encode', () => {
    it('should encode empty string as empty string', () => {
      expect(BaseEmoji.encode('')).toEqual('');
    });
    
    it('should encode empty Uint8Arrays as empty string', () => {
      expect(BaseEmoji.encode(new Uint8Array(0))).toEqual('');
    });
    
    it('should encode strings correctly', () => {
      expect(BaseEmoji.encode('hi!')).toEqual('🍒🌒😟🕕');
      expect(BaseEmoji.encode('base-emoji')).toEqual('🌱🗾🤵🐷🍇🥅🔝🚏');
    });
    
    it('should pad strings correctly', () => {
      expect([...BaseEmoji.encode('a')].pop()).toEqual(specialEmojis.padding[2]);
      expect([...BaseEmoji.encode('aa')].pop()).toEqual(specialEmojis.padding[4]);
      expect([...BaseEmoji.encode('aaa')].pop()).toEqual(specialEmojis.padding[6]);
      expect([...BaseEmoji.encode('aaaa')].pop()).toEqual(specialEmojis.padding[8]);
      
      expect([...BaseEmoji.encode('aaaaaa')].pop()).toEqual(specialEmojis.padding[2]);
      expect([...BaseEmoji.encode('aaaaaaa')].pop()).toEqual(specialEmojis.padding[4]);
      expect([...BaseEmoji.encode('aaaaaaaa')].pop()).toEqual(specialEmojis.padding[6]);
      expect([...BaseEmoji.encode('aaaaaaaaa')].pop()).toEqual(specialEmojis.padding[8]);
      

      for (let paddingEmoji of specialEmojis.padding) {
        expect([...BaseEmoji.encode('aaaaa')].pop()).not.toEqual(paddingEmoji);
        expect([...BaseEmoji.encode('aaaaaaaaaa')].pop()).not.toEqual(paddingEmoji);
      }
    });
    
    it('should wrap strings correctly', () => {
      const notWrapped = BaseEmoji.encode('x'.repeat(80));
      for (const char of [...notWrapped]) expect(char).not.toEqual('\n');
      
      const wrapped1 = BaseEmoji.encode('x'.repeat(80), { wrap: 32 });
      const wrapped2 = BaseEmoji.encode('x'.repeat(77), { wrap: 32 });
      const wrapped3 = BaseEmoji.encode('x'.repeat(81), { wrap: 32 });
      
      const lines1 = wrapped1.split('\n');      
      const lines2 = wrapped2.split('\n');      
      const lines3 = wrapped3.split('\n');      
      
      expect(lines1.length).toBe(2);
      expect(lines2.length).toBe(2);
      expect(lines3.length).toBe(3);
      
      expect([...lines1[0]].length).toBe(32);
      expect([...lines1[1]].length).toBe(32);

      expect([...lines2[0]].length).toBe(32);
      expect([...lines2[1]].length).toBe(31);

      expect([...lines3[0]].length).toBe(32);
      expect([...lines3[1]].length).toBe(32);
      expect([...lines3[2]].length).toBe(2);
    });
    
    it('should armor strings correctly', () => {
      const armored = BaseEmoji.encode('x'.repeat(80), { wrap: 32, armor: true });
      const lines = armored.split('\n');
      
      expect(lines[0]).toEqual('🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔢💝🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵');
      expect(lines[lines.length - 1]).toEqual('🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔢💔🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵');
    });
  });
  
  describe('decode', () => {
    it('should decode empty strings into empty strings', () => {
      expect(BaseEmoji.decode('')).toEqual('');
    });
    
    it('should decode empty strings into empty Uint8Arrays', () => {
      expect(BaseEmoji.decode('', {format: 'binary'})).toEqual(new Uint8Array(0));
    });
    
    it('should decode strings correctly', () => {
      expect(BaseEmoji.decode('🍒🚓📿🙉🤍💼🕎🚥🌿🕑')).toEqual('hello world');
    });
    
    it('should decode strings with garbage correctly, if garbage is ignored', () => {
      expect(BaseEmoji.decode('🍒asdf🚓jkl📿qwer 🙉uio\n\n🤍💼🕎🚥🌿🕑', {ignoreGarbage: true})).toEqual('hello world');
    });
    
    it('should decode random binary data back into its original form', () => {
      for (let i = 0; i < 10; i++) {
        const length = crypto.randomInt(100, 2000);
        const bytes = new Uint8Array(length);
        crypto.randomFillSync(bytes);
        
        const encoded = BaseEmoji.encode(bytes);
        const encodedWrapped = BaseEmoji.encode(bytes, { wrap: 32 });
        const encodedArmored = BaseEmoji.encode(bytes, { wrap: 40, armor: true });
        
        expect(BaseEmoji.decode(encoded, { format: 'binary' })).toEqual(bytes);
        expect(BaseEmoji.decode(encodedWrapped, { format: 'binary' })).toEqual(bytes);
        expect(BaseEmoji.decode(encodedArmored, { format: 'binary' })).toEqual(bytes);
      }
    })
  });
});