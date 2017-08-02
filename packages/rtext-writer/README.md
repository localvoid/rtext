# Rich Text Writer

`rtext-writer` package provides an easy-to-use interface for composing rich texts. It is using a
[builder pattern](https://en.wikipedia.org/wiki/Builder_pattern) with a chainable API.

```ts
class RichTextWriter {
  constructor();
  write(...ws: Array<string | RichText | ((w: RichTextWriter) => void)>): RichTextWriter;
  begin(type: string, data?: any): RichTextWriter;
  beginKey(key: string, type: string, data?: any): RichTextWriter;
  end(type: string): RichTextWriter;
  endKey(key: string, type: string): RichTextWriter;
  continue(type: string, data?: any): RichTextWriter;
  continueKey(key: string, type: string, data?: any): RichTextWriter;
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

## Example

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

## Example from the iko library

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