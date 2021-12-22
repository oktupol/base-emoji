import { emojiDecodeMap, emojis } from './emojis';

describe('Emojis', () => {
  describe('emojis array', () => {
    it('should contain 1024 emojis', () => {
      expect(emojis.length).toBe(1024);

      for (let emoji of emojis) {
        expect(typeof emoji).toEqual('string');
        expect([...emoji].length).toBe(1);
      }
    });
  });
  
  describe('emojisDecodeMap', () => {
    it('should map back to original emojis', () => {
      for (let i = 0; i < 1024; i++) {
        const emoji = emojis[i];

        expect(emojiDecodeMap[emoji]).toBe(i);
      }
    });
  });
});