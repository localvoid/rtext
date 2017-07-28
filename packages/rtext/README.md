# Rich Text Core Data Structures

This package provides type definitions for `rtext` core data structures.

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
