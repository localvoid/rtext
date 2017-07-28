import { RichTextAnnotation, RichText } from "rtext";

interface MutableRichTextAnnotation<T = any> extends RichTextAnnotation<T> {
  end: number;
}

export class RichTextWriter {
  private position: number;
  private text: string;
  private annotations: MutableRichTextAnnotation[];
  private open: number;

  constructor() {
    this.position = 0;
    this.text = "";
    this.annotations = [];
    this.open = 0;
  }

  write(...ws: Array<string | RichText | ((w: RichTextWriter) => void)>): RichTextWriter {
    for (let i = 0; i < ws.length; i++) {
      const s = ws[i];

      if (typeof s === "string") {
        this.text += s;
        this.position += s.length;
      } else if (typeof s === "function") {
        s(this);
      } else {
        if (s.text.length > 0) {
          this.text += s.text;
          if (s.annotations !== undefined) {
            if (this.position > 0) {
              for (let i = 0; i < s.annotations.length; i++) {
                const a = s.annotations[i];
                this.annotations.push({
                  type: a.type,
                  start: this.position + a.start,
                  end: this.position + a.end,
                  data: a.data,
                  key: a.key,
                });
              }
            } else {
              this.annotations = this.annotations
                .concat(s.annotations as MutableRichTextAnnotation[]);
            }
          }
        }
        this.position += s.text.length;
      }
    }
    return this;
  }

  begin(type: string, data?: any): RichTextWriter {
    this.open++;
    beginAnnotation(this.annotations, type, this.position, data);
    return this;
  }

  beginKey(key: string, type: string, data?: any): RichTextWriter {
    this.open++;
    beginAnnotation(this.annotations, type, this.position, data, key);
    return this;
  }

  end(type: string): RichTextWriter {
    this.open--;
    endAnnotation(this.annotations, type, this.position);
    return this;
  }

  endKey(key: string, type: string): RichTextWriter {
    this.open--;
    endAnnotation(this.annotations, type, this.position, key);
    return this;
  }

  compose(): RichText {
    let annotations = this.annotations;
    if (this.open > 0) {
      const as = annotations;
      annotations = [];
      for (let i = 0; i < as.length; i++) {
        const a = as[i];
        if (a.start !== this.position) {
          if (a.start === a.end) {
            annotations.push({
              type: a.type,
              start: a.start,
              end: this.position,
              data: a.data,
              key: a.key,
            });
          } else {
            annotations.push(a);
          }
        }
      }
    }

    return {
      text: this.text,
      annotations: annotations.length === 0 ? undefined : annotations,
    };
  }
}

export function richText(): RichTextWriter {
  return new RichTextWriter();
}

function beginAnnotation(
  annotations: RichTextAnnotation[],
  type: string,
  position: number,
  data?: any,
  key?: string,
): void {
  annotations.push({
    type,
    start: position,
    end: position,
    data,
    key,
  });
}

function endAnnotation(
  annotations: MutableRichTextAnnotation[],
  type: string,
  position: number,
  key?: string,
): void {
  let i = annotations.length - 1;
  while (i >= 0) {
    const a = annotations[i];
    if (a.type === type && a.key === key) {
      if (a.start < position) {
        a.end = position;
      } else {
        annotations.splice(i, 1);
      }
      break;
    }
    i--;
  }
}
