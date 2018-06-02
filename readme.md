# dynamic-import-ponyfill [![Build Status](https://travis-ci.org/lukeed/dynamic-import-ponyfill.svg?branch=master)](https://travis-ci.org/lukeed/dynamic-import-ponyfill)

> A tiny (141B) [ponyfill](https://github.com/sindresorhus/ponyfill#how-are-ponyfills-better-than-polyfills) for dynamic imports &mdash; `import()`

---

Only CommonJS and UMD scripts are supported by this package. Any attempts to dynamically import [ES6 modules](http://exploringjs.com/es6/ch_modules.html#sec_basics-of-es6-modules) will throw an error! Most (if not all) browsers that can understand ESM exports already have native `import()` support!

---

Package relies on `Promise` and `fetch` support. If you need to polyfill these as well, I'd suggest [`zousan`](https://github.com/bluejava/zousan) and [`unfetch`](https://github.com/developit/unfetch) respectively.

This module exposes three module definitions:
- **ESM**: `dist/import.es.js`
- **CommonJS**: `dist/import.js`
- **UMD**: `dist/import.min.js`

There is no built-in check for whether or not the current browser supports `import()` natively. <br>If you'd like to check, you may do so with the following:

```js
function supported() {
  try {
    return !!new Function('import("")');
  } catch (e) {
    return false;
  }
}
```

## Install

```
$ npm install --save dynamic-import-ponyfill
```

Then with a module bundler like [rollup](https://rollupjs.org/) or [webpack](https://webpack.js.org/), use as you would anything else:

```js
// using ES6 modules
import dip from 'dynamic-import-ponyfill';

// using CommonJS modules
const dip = require('dynamic-import-ponyfill');
```

The [UMD](https://github.com/umdjs/umd) build is also available on [unpkg](https://unpkg.com/):

```html
<script src="https://unpkg.com/dynamic-import-ponyfill/dist/import.min.js"></script>
```

This exposes the function as `window.import`!

> **CAUTION:** Browsers that recognize `import` and `import()` will only respond to `window.import` explicitly!

## Usage

```js
//------ foo.js ------
exports.sqrt = Math.sqrt;
exports.square = x => x * x;

//------ bar.js ------
module.exports = (x, y) => {
  var z = x + y;
  return z * z * z;
}

//------ src/index.js ------
import dImport from 'dynamic-import-ponyfill';

dImport('/foo.js').then(mod1 => {
  let { sqrt, square } = mod1.default || mod1;
  square(12);  //=> 144
  sqrt(36); //=> 6

  dImport('/bar.js').then(mod2 => {
    let fn = mod2.default || mod2;
    fn(3, 4); //=> 343
  })
});
```


## API

### import(url)

Returns: `Promise`

Returns a Promise containing the the CommonJS module contents.

<!-- > **Note:** The Promise-requestor is cached for instant reuse. -->

#### url
Type: `String`

The URL of the CommonJS script to import.


## License

MIT © [Luke Edwards](https://lukeed.com)
