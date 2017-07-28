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
  compose(): RichText;
}

function richText(): RichTextWriter;
```

API is pretty simple, `begin()` and `end()` methods are used to specify annotations, `write()` is used to write text and
`compose()` to get results.

`beginKey()` and `endKey()` are used to create overlapping annotations that have the same `type`. When `endKey()` is
used, it will try to find an annotation with a matching `type` and `key`.

`richText()` is a simple helper function that will instantiate `RichTextWriter` objects.

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
