# ๐ช๐พ๐คต๐ฏ Base Emoji ๐ฆง๐ฅ๐๐

There is base32, there is base64, now there is base-emoji!

## Installation

Install base-emoji as a cli executable using npm:

```bash
npm install -g @oktupol/base-emoji
```

or as a library inside your Javascript or Typescript project:

```bash
npm install @oktupol/base-emoji
```

## Usage

### CLI

- Encode data from stdin:

    ```
    echo 'Hello World' | base-emoji

    ==> ๐๐๐ฟ๐๐ค๐๐๐ฅ๐ฟ๐ค๐
    ```
    
- Decode with the flag `-d`

    ```
    echo '๐๐ป๐ช๐ฆญ๐๐ป๐ชถ๐ฆ๐๐๐ฉ๐ถ๐' | base-emoji -d

    ==> I like emojis
    ```

- Encode or decode data from a file

    ![Cat](./examples/cat.jpg)
    <small>[cat.jpg](./examples/cat.jpg) - 2009, [Michael Wilson](https://www.flickr.com/photos/michaelpwilson/5430883069/) CC BY-NC-ND 2.0</small>

    ```
    base-emoji cat.jpg

    ==>
    โฟ๐พ๐๐คน๐ค๐ก๐ป๐ฆ๐๐๐๐คน๐๐๐๐๐๐คช๐๐คน๐๐๐๐๐๐๐คฃ๐ถ๐๐๐๐
    ๐๐๐๐คพ๐ชฃ๐๐๐ป๐ง๐บ๐๐งพ๐ง๐ฅป๐๐ท๐จ๐๐ฅ๐๐ช๐๐คน๐๐๐๐ค๐ฆ๐๐๐๐ฟ
    ๐ค๐๐๐คน๐๐คจ...
    ```
    <small>[cat.jpg.emoji](./examples/cat.jpg.emoji) - full output of above command</small>

- Direct the output of any command into a file
    
    ```
    base-emoji -d dog.jpg.emoji > dog.jpg
    ```
    
- When encoding, optionally use the `-a` flag to armor the output

    ```
    base-emoji -a some-document.pdf
    
    ==> 
    ๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ข๐๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต
    ๐ฆ๐ญ๐ช๐๐คฅ๐โณ๐๐๐คด๐๐ฒ๐ฆฅ๐๐๐๐๐๐ค๐ฅ๐คช๐๐๐๐งช๐ฟ๐พ๐๐๐ฆ๐ฎ๐
    ...
    ๐๐๐๐๐ฆ๐ซ๐ช๐ฆถ๐ช๐ฅ๐ค๐
    ๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ข๐๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต
    ```
    
- When encoding with armor, optionally use the `--descriptor` option to specify a descriptor

    ```
    gpg --export-secret-key my@email.tld | base-emoji -a --descriptor '๐คซ๐๐'
    
    ==>
    ๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐คซ๐๐๐๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต
    ๐ง๐ฆ๐ฆฒ๐๐๐ง๐ช๐ซ๐ค๐ฅฏ๐ฆญ๐ฅฌ๐ธ๐ชฆ๐๐ชถ๐ฏ๐ธ๐ฅโ๐งโฟ๐ช?๐๐ชฅ๐ฅ๐๐๐ฆ๐ง๐๐ด
    ...
    ๐ฃ๐ถ๐๐ฆ๐ฆ๐๐ฑ๐๐ฑโ๐ต๐
    ๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐คซ๐๐๐๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต๐ต    

- For a complete list of available options, run
    ```
    base-emoji --help
    ```

### Inside a Node project

The base-emoji library can be imported using

CommonJS:
```javascript
const { BaseEmoji } = require('@oktupol/base-emoji');
```

ES6, Typescript:
```typescript
import { BaseEmoji } from '@oktupol/base-emoji';
```

There are two functions:

#### `BaseEmoji.encode()`

Usage:
```javascript
const result = BaseEmoji.encode(data, options);
```

Parameters:
- `data` (required) being any of:
  - a string
  - an ArrayBufferLike (e.g. ArrayBuffer, Uint8Array)

- `options` (optional) - an object with following structure; all keys are optional:
    ```
    {
      armor?: boolean;
      armorDescriptor?: boolean;
      wrap?: number;
    }
    ```
    - `armor` - if true, the resulting output will be armored.
    - `armorDescriptor` - when armored, the value will be used in the header and footer of the output
    - `wrap` - if provided, wrap after _n_ characters
    
#### `BaseEmoji.decode()`

Usage:
```javascript
const result = BaseEmoji.decode(data, options);
```

Parameters:
- `data` (required) - A base-emoji encoded string
- `options` (optional) - an object with following structure; all keys are optional:
    ```
    {
      output: 'string' | 'binary'
    }
    ```
    - `output` - return the output as String, if `string`, or as Uint8Array, if `binary`
    
## How does it work

The prinicple is identical to that of base64. In base64, data bits are
rearranged from their original 8-tuple bytes into 6-tuples, of which there are
64, and each of these 6-tuples is then represented with one ascii character.

```
bytes  |    104 = h    |    105 = i    |     33 = !    | ...
DATA   |0 1 1 0 1 0.0 0'0 1 1 0.1 0 0 1'0 0.1 0 0 0 0 1| ...
base64 |   26 = a  |    6 = G  |   36 = k  |   33 = h  | ...
```

Therefore, the base64 representation of `hi!` is `aGkh`.

In base-emoji, 1024 different symbols are used for representing 10-tuples.

```
bytes      |    104 = h    |    105 = i    |     33 = !    |              ...
DATA       |0 1 1 0 1 0 0 0'0 1.1 0 1 0 0 1'0 0 1 0.0 0 0 1'0 0 0 0 0 0.0 ...
base-emoji |      417 = ๐     |      658 = ๐     |       64 = ๐     |  ...
```

The complete list of emojis is located in [emoji-map.json](./emoji-map.json)

### Padding

Since 10 quite obviously doesn't divide evenly into 8, base-emoji-encoded data
contains a few bits more of information at the end than the original data. In
case of above example, the base-emoji encoded representation of the string
`hi!` has 6 bits of information overhanging. This is important to know
especially once there are is an overhang of 8 bits, because then it would
otherwise be ambiguous whether the last 8 bits are a byte of the original
information or not.

To indicate the length of the overhang, following symbols are appended to the
end of the base-emoji encoded string:

| Padding character | ๐ | ๐ | ๐ | ๐ | ๐ | ๐ | ๐ | ๐ | ๐ | ๐ |
|-------------------|----|----|----|----|----|----|----|----|----|----|
| Bits of overhang  |  0 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9 |

Whereas the padding character for 0 bits of overhang is optional, and the
characters for 1, 3, 5, 7 and 9 bits can't realistically occur.

In above example, there are six bits of overhang, meaning the emoji
representation receives the padding character ๐. Hence, the full base-emoji
representation of `hi!` is ๐๐๐๐.

### Efficiency

All that being said, base-emoji is _horribly_ inefficient at encoding data.

In base64, where every 6-tuple of bits is encoded in one ascii character of one
byte, the encoded data size is 4/3 times the original data size, i.e. around
33.3% larger.

In base-emoji, we use 1024 symbols to encode 10-tuples, however, these 1024
symbols are _Unicode!_ An exact number can't be given due to unicode characters
being of variable size, but a quick test with 1000 random bytes showed a
threefold increase.

```
head -c 1000 /dev/urandom | base64 | wc -c
==> 1354

head -c 1000 /dev/urandom | base32 | wc -c
==> 1622

head -c 1000 /dev/urandom | base-emoji | wc -c
==> about 3175
```