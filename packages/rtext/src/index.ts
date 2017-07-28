export interface RichTextAnnotation<T = any> {
  readonly type: string;
  readonly start: number;
  readonly end: number;
  readonly data?: T;
  readonly key?: string;
}

export interface RichText {
  readonly text: string;
  readonly annotations?: RichTextAnnotation[];
}
