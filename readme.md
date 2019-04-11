# dimport [![Build Status](https://badgen.now.sh/travis/lukeed/dimport)](https://travis-ci.org/lukeed/dimport)

> Run ES Module syntax (`import`, `import()`, and `export`) in any browser &mdash; even IE!

At its core, `dimport` is a polyfill for ES Module syntax, including [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Dynamic_Imports)!<br>
And with it, you can serve modern ESM-driven application files to any browser.

While browsers _are_ increasing support for JavaScript modules natively, the current landscape is not easy to navigate.<br>
For example, many browsers _do support_ ESM syntax (aka, `import` and `export`) within `<script type=module />` tags; however, not all of these support _dynamic import_ statements since it came later.
In order to leverage the benefits of ESM today, a developer must choose between:

* dropping support for lagging browsers
* complicating their development process
* building and/or distributing multiple versions of their application
* abstaining from shipping ESM syntax at all :cry:

Now, `dimport` allows the developer to ship ESM **today** to all browsers without compromise.<br>
Better yet, the development and distribution processes are simplified, if not unchanged.

PS: Check out the [`/examples`](/examples) directory~!

<br>

---

***Important***

This module **does not** convert your ES2015+ syntax into ES5 or below!<br>
While `dimport` may allow older browsers to parse and interpret the ESM format, it does nothing to make the _contents_ of your file(s) backwards compatible.

---

<br>

## Modes

There are three "versions" of `dimport`, each of which utilize different APIs and approaches to yield full ESM compatibility.

Please note that **all modes** check for native `import()` support first and foremost.<br>
This means that `dimport` won't do anything if it doesn't have to.

#### "module"
> **Size (gzip):** 675 bytes<br>
> **Availability:** [UMD](https://unpkg.com/dimport), [CommonJS](https://unpkg.com/dimport/dist/index.js), [ES Module](https://unpkg.com/dimport?module)<br>
> **Requires:** `script[type=module]`, `fetch`, `Promise`, `URL`

Since _static_ `import` statements are supported, this mode parses all _dynamic_ `import()`s and creates temporary `script[type=module]` tags pointing to the resource's full, canonical URL. Once the temporary script loads, the originating Promise is resolved, returning the contents.

#### "nomodule"
> **Size (gzip):** 918 bytes<br>
> **Availability:** [UMD](https://unpkg.com/dimport/nomodule), [ES Module](https://unpkg.com/dimport/nomodule/index.mjs)<br>
> **Requires:** `fetch`, `Promise`, `URL`

All `import`, `export`, and `import()` statements are dynamically rewritten to CommonJS modules so that their contents/exports are easily returned.

Any `import` statements are parsed early, ensuring full canonical URLs, and then the whole file is wrapped in a `Promise.all` chain, guaranteeing each `import` its desired module.

#### "legacy"
> **Size (gzip):** 1143 bytes<br>
> **Availability:** [UMD](https://unpkg.com/dimport/legacy), [ES Module](https://unpkg.com/dimport/legacy/index.mjs)<br>
> **Requires:** `Promise`, `XMLHttpRequest`

Takes the same approach as ["nomodule"](#nomodule), but inserts alternatives to `fetch` and `URL`.

> **Important:** You will need to supply your own Promise polyfill for IE support.


## Usage

> Don't miss the [`/examples`](/examples) directory :sparkles:

It's possible to use `dimport` in a variety of ways!

The simplest way is to connect a few `<script/>` tags to [unpkg.com](https://unpkg.com/):

```html
<!-- Load the "module" version on browsers that can support it. -->
<script type="module" src="https://unpkg.com/dimport?module" data-main="/bundle.js"></script>

<!-- Load the "nomodule" version on older browsers – acts as fallback! -->
<script type="nomodule" src="https://unpkg.com/dimport/nomodule" data-main="/bundle.js"></script>
```

In the sample above, a browser will automatically choose which script `type` to parse.<br>
This means the two scripts can live side-by-side without loading your application twice!<br>
Finally, the _same_ application file (`bundle.js`) can be used, despite the `module`-vs-`nomodule` choice.

You will also notice that the scripts have a `data-main=""` attribute.<br>
This is the path to _your application_ or _your ESM-containing file_ you wish to load.

Once `dimport` has loaded, it circles back and see that its `<script/>` caller also wants it to load a file.<br>
Alternatively, `dimport` can load an inline script from its caller!

```html
<!-- We can use any "mode" here, but choosing only 1 for simplicity -->
<script src="https://unpkg.com/dimport/nomodule">
  // Notice that we can use `import` inside a script without "type=module"
  import { h, render } from 'https://unpkg.com/preact?module';

  render(
    h('h1', null, 'Hello world'),
    document.body
  );
</script>
```

Finally, `dimport` is available for programmatic use and/or usable _within_ your bundle (via Webpack or Rollup)

```
$ npm install --save dimport
```

```js
import dimport from 'dimport';
// or, without bundling
import dimport from 'https://unpkg.com/dimport?module';

// Pass in URLs or file paths
// ~> like `import()` usage
dimport('./foo.js').then(...);
```


## API – Programmatic

### dimport(url)

Returns: `Promise`

Returns a Promise containing the module.

<!-- > **Note:** The Promise-requestor is cached for instant reuse. -->

#### url
Type: `String`

The URL of the script to import.

> **Note:** Will be transformed into a full URL if not already – see [`new URL()`](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#Examples)


## Browser Support

The `dimport` columns yield support for **both** static and dynamic imports.

> **Important:** Chart represents ESM syntax only!<br>Not indicative of ES2015+ syntax usage within your app.

| Browser | `import`<br>native | `import()`<br>native | dimport<br>module | dimport<br>nomodule | dimport<br>legacy |
|---------|--------------------|----------------------|-------------------|---------------------|-------------------|
| Chrome  | 61                 | 63                   | 61                | 42                  | :+1:<sup>*</sup>  |
| Safari  | 10.1               | 11.1                 | 10.1              | 10.1                | :+1:<sup>*</sup>  |
| Firefox | 60                 | 67                   | 60                | 39                  | :+1:<sup>*</sup>  |
| Edge    | 16                 | :x:                  | 16                | 14                  | :+1:<sup>*</sup>  |
| IE      | :x:                | :x:                  | :x:               | :x:                 | 7 <sup>*</sup>     |

<sup>*</sup> _Indicates support with `Promise` polyfill supplied_


## Prior Art

* [`dynamic-import-ponyfill`](https://www.npmjs.com/package/dynamic-import-ponyfill) – The "first version" of `dimport` – now deprecated.
* [`shimport`](https://github.com/Rich-Harris/shimport) – Patient zero. Similar to "nomodule" mode. Made it "okay" to rewrite files on the fly.

## License

MIT © [Luke Edwards](https://lukeed.com)
