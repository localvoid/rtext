# Rich Text Renderer

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

## Priorities

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

## Hooks

`onInit()` hook is used to initialize an internal state. It should return a root context.

`onEnter()` and `onExit()` hooks will be invoked each time renderer enters or exits an annotation. When renderer enters
an annotation with a higher priority than annotations in the current context, it will always exit from annotations with
lower priorities and then re-enter into them. `onEnter()` hook should return a data structure with a current context.

`onText()` hook will be invoked with a current context when text is rendered.

`onResult()` hook should return a result of a renderer from a root context.

## Example

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
