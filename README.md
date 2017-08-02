# Rich Text

It is a set of packages for generating and transforming rich texts into different formats.

- [rtext](https://www.npmjs.com/package/rtext) - Type definitions for core data structures.
- [rtext-writer](https://www.npmjs.com/package/rtext-writer) - Easy-to-use interface for composing rich texts.
- [rtext-render](https://www.npmjs.com/package/rtext-render) - Pluggable rich text renderer.

## Motivation

Just wanted to improve error reporting with backward compatbility in existing software.

## Core Data Structures

Rich text is stored as a simple string with an additional array of annotations.

```ts
interface RichText {
  readonly text: string;
  readonly annotations?: RichTextAnnotation[];
}
```

Annotations has a `type`, `start` and `end` positions that specify annotated range. Optional `data` property can
provide an additional data, and optional `key` property helps with overlapping annotations.

```ts
interface RichTextAnnotation<T = any> {
  readonly type: string;
  readonly start: number;
  readonly end: number;
  readonly data?: T;
  readonly key?: string;
}
```

All annotations stored in `RichText` should be sorted by their `start` positions. `rtext-writer` package
automatically guarantee that rich text composed by this package will be in correct format.

And that is all, you are free to choose which types to use and what data to store. With `rtext-render` package it will
be easy to convert rich texts into any format you like, for example, colored output in terminal, or HTML in browser.

## Rich Text Writer

`rtext-writer` package provides an easy-to-use interface for composing rich texts. It is using a
[builder pattern](https://en.wikipedia.org/wiki/Builder_pattern) with a chainable API.

```ts
class RichTextWriter {
  constructor();
  write(...ws: Array<string | RichText | ((w: RichTextWriter) => void)>): this;
  begin(type: string, data?: any): this;
  beginKey(key: string, type: string, data?: any): this;
  end(type: string): this;
  endKey(key: string, type: string): this;
  continue(type: string, data?: any): this;
  continueKey(key: string, type: string, data?: any): this;
  compose(): RichText;
}

function richText(): RichTextWriter;
function rt(
  literals: TemplateStringsArray,
  ...placeholders: Array<string | RichText | ((w: RichTextWriter) => void)>,
): (w: RichTextWriter) => void;
```

API is pretty simple, `begin()` and `end()` methods are used to specify annotations, `write()` is used to write text and
`compose()` to get results.

`beginKey()` and `endKey()` are used to create overlapping annotations that have the same `type`. When `endKey()` is
used, it will try to find an annotation with a matching `type` and `key`.

`continue()` methods will reuse the last annotation when it has the same `end` position and all properties are matching.

`richText()` is a simple helper function that will instantiate `RichTextWriter` objects.

`rt()` is a tagged template literal that will create a writer function.

### Example

```ts
function expected(value: any) {
  return function(w: RichTextWriter) {
    w.begin("expected").write(JSON.stringify(value)).end("expected");
  };
}

function received(value: any) {
  return function(w: RichTextWriter) {
    w.begin("received").write(JSON.stringify(value)).end("received");
  };
}

const a = { value: 1 };
const b = { value: 2 };

const errorMessage = richText()
  .begin("errorTitle").write("Error Title\n").end("errorTitle")
  .write("Expected: ", expected(a), "\n")
  .write("Received: ", received(b), "\n")
  .compose();
```

### Example from the iko library

[iko](https://github.com/localvoid/iko) has a high-level API that was built on top of `RichTextWriter`, and it looks
like this:

```ts
export class NumberAssertion extends Assertion<number> {
  toBeApproximatelyEqual(number: number, epsilon = Number.EPSILON): this {
    const a = this.obj;
    const b = number;
    const aAbs = Math.abs(a);
    const bAbs = Math.abs(b);
    const pass = Math.abs(a - b) <= (aAbs < bAbs ? bAbs : aAbs) * epsilon;

    if (!pass) {
      const message = errMsg()
        .matcherHint("toBeApproximatelyEqual", "received", "expected", "epsilon")
        .hint(rt`abs(${rA} - ${eB}) <= (abs(${rA}) < abs(${eB}) ? abs(${eB}) : abs(${rA})) * ${eE}\n\n`)
        .info(rt`Expected number to be approximately equal to ${e(b)}, intstead received ${r(a)}\n`);

      throw new AssertionError(message.compose(), this.toBeApproximatelyEqual);
    }

    return this;
  }
}
```

## Rich Text Renderer

`rtext-render` provides a pluggable renderer that deals with all complexities, so you just need to specify several hooks
and it will be ready to render into any format you like.

```ts
interface RichTextRendererHooks<C, R> {
  onInit(): C;
  onEnter(annotation: RichTextAnnotation, parentContext: C): C;
  onExit(annotation: RichTextAnnotation, context: C, parentContext: C): void;
  onText(text: string, context: C): void;
  onResult(context: C): R;
}

function createRichTextRenderer<C, R>(
  priorities: { [key: string]: number },
  hooks: RichTextRendererHooks<C, R>,
): (richText: RichText) => R;
```

`createRichTextRenderer()` function is used to create a new renderers. It has two parameters, `priorities` to specify
priorities for annotation types and `hooks` that will be invoked when renderer will process rich text.

### Priorities

Priorities are used to resolve conflicts with overlapping annotations and to make sure that we can generate consistent
HTML documents.

For example, when generating HTML anchors, they should have a precedence over `b` elements.

```
Just some random text with an anchor element
          [ bold         ]
                      [ link       ]
```

When converting this rich text to HTML we would like to get HTML like this:

```html
Just some <b>random text </b><a><b>with</b> an anchor</a> element
```

### Hooks

`onInit()` hook is used to initialize an internal state. It should return a root context.

`onEnter()` and `onExit()` hooks will be invoked each time renderer enters or exits an annotation. When renderer enters
an annotation with a higher priority than annotations in the current context, it will always exit from annotations with
lower priorities and then re-enter into them. `onEnter()` hook should return a data structure with a current context.

`onText()` hook will be invoked with a current context when text is rendered.

`onResult()` hook should return a result of a renderer from a root context.

### Example

In this example we will render rich text into a colored output in a terminal with a
[chalk](https://www.npmjs.com/package/chalk) package.

```js
import { createRichTextRenderer } from "rtext-render";
import * as chalk from "chalk";

const render = createRichTextRenderer(
  {
    "bold": 1,
    "underline": 2,
    "color": 3,
    "bgColor": 4,
  },
  {
    onInit: () => ({ chalk, result: "" }),
    onEnter: (a, c) => {
      let newChalk = c.chalk;
      switch (a.type) {
        case "bold":
          newChalk = newChalk.bold;
          break;
        case "underline":
          newChalk = newChalk.underline;
          break;
        case "color":
          newChalk = newChalk[a.data];
          break;
        case "bgColor":
          const color = `bg${a.data[0].toUpperCase()}${a.data.slice(1)}`;
          newChalk = newChalk[color];
          break;
      }
      return { chalk: newChalk, result: "" };
    },
    onExit: (a, c, p) => {
      p.result += c.result;
    },
    onText: (t, c) => { c.result += c.chalk(t); },
    onResult: (c) => c.result,
  },
);
```
