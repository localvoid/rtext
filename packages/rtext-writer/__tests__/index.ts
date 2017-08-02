import { expect } from "iko";
import { richText } from "../src/index";

describe("empty", () => {
  const empty = richText().compose();

  it("should have empty text", () => {
    expect(empty.text).toBe("");
  });

  it("should have null annotations", () => {
    expect(empty.annotations).toBe(undefined);
  });
});

describe("basic text block", () => {
  const empty = richText()
    .write("123")
    .compose();

  it("should have text '123'", () => {
    expect(empty.text).toBe("123");
  });

  it("should have null annotations", () => {
    expect(empty.annotations).toBe(undefined);
  });
});

describe("two consecutive text blocks", () => {
  const empty = richText()
    .write("123")
    .write("456")
    .compose();

  it("should have text '123456'", () => {
    expect(empty.text).toBe("123456");
  });

  it("should have null annotations", () => {
    expect(empty.annotations).toBe(undefined);
  });
});

describe("annotated text block", () => {
  const t = richText()
    .begin("a", 1)
    .write("123")
    .end("a")
    .compose();

  it("should have text '123'", () => {
    expect(t.text).toBe("123");
  });

  it("should have annotations length 1", () => {
    expect(t.annotations).notToBe(undefined);
    expect(t.annotations!.length).toBe(1);
  });

  it("should have annotation a:1", () => {
    const a = t.annotations![0];
    expect(a.type).toBe("a");
    expect(a.data).toBe(1);
    expect(a.start).toBe(0);
    expect(a.end).toBe(3);
  });
});

describe("two consecutive annotated text blocks", () => {
  const t = richText()
    .begin("a", 1)
    .write("123")
    .write("456")
    .end("a")
    .compose();

  it("should have text '123456'", () => {
    expect(t.text).toBe("123456");
  });

  it("should have annotations length 1", () => {
    expect(t.annotations).notToBe(undefined);
    expect(t.annotations!.length).toBe(1);
  });

  it("should have annotation a:1", () => {
    const a = t.annotations![0];
    expect(a.type).toBe("a");
    expect(a.data).toBe(1);
    expect(a.start).toBe(0);
    expect(a.end).toBe(6);
  });
});

describe("one annotated text blocks with one prepending basic text block", () => {
  const t = richText()
    .write("123")
    .begin("a", 1)
    .write("456")
    .end("a")
    .compose();

  it("should have text '123456'", () => {
    expect(t.text).toBe("123456");
  });

  it("should have annotations length 1", () => {
    expect(t.annotations).notToBe(undefined);
    expect(t.annotations!.length).toBe(1);
  });

  it("should have annotation a:1", () => {
    const a = t.annotations![0];
    expect(a.type).toBe("a");
    expect(a.data).toBe(1);
    expect(a.start).toBe(3);
    expect(a.end).toBe(6);
  });
});

describe("one annotated text blocks with one appending basic text block", () => {
  const t = richText()
    .begin("a", 1)
    .write("123")
    .end("a")
    .write("456")
    .compose();

  it("should have text '123456'", () => {
    expect(t.text).toBe("123456");
  });

  it("should have annotations length 1", () => {
    expect(t.annotations).notToBe(undefined);
    expect(t.annotations!.length).toBe(1);
  });

  it("should have annotation a:1", () => {
    const a = t.annotations![0];
    expect(a.type).toBe("a");
    expect(a.data).toBe(1);
    expect(a.start).toBe(0);
    expect(a.end).toBe(3);
  });
});

describe("one annotated text blocks with one appending and one prepending basic text blocks", () => {
  const t = richText()
    .write("123")
    .begin("a", 1)
    .write("456")
    .end("a")
    .write("789")
    .compose();

  it("should have text '123456789'", () => {
    expect(t.text).toBe("123456789");
  });

  it("should have annotations length 1", () => {
    expect(t.annotations).notToBe(undefined);
    expect(t.annotations!.length).toBe(1);
  });

  it("should have annotation a:1", () => {
    const a = t.annotations![0];
    expect(a.type).toBe("a");
    expect(a.data).toBe(1);
    expect(a.start).toBe(3);
    expect(a.end).toBe(6);
  });
});

describe("two different annotations: [a][b][/b][/a]", () => {
  const t = richText()
    .begin("a", 1)
    .begin("b", 2)
    .write("123")
    .end("b")
    .end("a")
    .compose();

  it("should have text '123'", () => {
    expect(t.text).toBe("123");
  });

  it("should have annotations length 2", () => {
    expect(t.annotations).notToBe(undefined);
    expect(t.annotations!.length).toBe(2);
  });

  it("should have annotation a:1", () => {
    const a = t.annotations![0];
    expect(a.type).toBe("a");
    expect(a.data).toBe(1);
    expect(a.start).toBe(0);
    expect(a.end).toBe(3);
  });

  it("should have annotation b:2", () => {
    const a = t.annotations![1];
    expect(a.type).toBe("b");
    expect(a.data).toBe(2);
    expect(a.start).toBe(0);
    expect(a.end).toBe(3);
  });
});

describe("two different annotations: [b][a][/b][/a]", () => {
  const t = richText()
    .begin("b", 2)
    .begin("a", 1)
    .write("123")
    .end("b")
    .end("a")
    .compose();

  it("should have text '123'", () => {
    expect(t.text).toBe("123");
  });

  it("should have annotations length 2", () => {
    expect(t.annotations).notToBe(undefined);
    expect(t.annotations!.length).toBe(2);
  });

  it("should have annotation a:1", () => {
    const a = t.annotations![1];
    expect(a.type).toBe("a");
    expect(a.data).toBe(1);
    expect(a.start).toBe(0);
    expect(a.end).toBe(3);
  });

  it("should have annotation b:2", () => {
    const a = t.annotations![0];
    expect(a.type).toBe("b");
    expect(a.data).toBe(2);
    expect(a.start).toBe(0);
    expect(a.end).toBe(3);
  });
});

describe("two different annotations: [a][b][/a][/b]", () => {
  const t = richText()
    .begin("a", 1)
    .begin("b", 2)
    .write("123")
    .end("a")
    .end("b")
    .compose();

  it("should have text '123'", () => {
    expect(t.text).toBe("123");
  });

  it("should have annotations length 2", () => {
    expect(t.annotations).notToBe(undefined);
    expect(t.annotations!.length).toBe(2);
  });

  it("should have annotation a:1", () => {
    const a = t.annotations![0];
    expect(a.type).toBe("a");
    expect(a.data).toBe(1);
    expect(a.start).toBe(0);
    expect(a.end).toBe(3);
  });

  it("should have annotation b:2", () => {
    const a = t.annotations![1];
    expect(a.type).toBe("b");
    expect(a.data).toBe(2);
    expect(a.start).toBe(0);
    expect(a.end).toBe(3);
  });
});

describe("two different annotations: [b][a][/a][/b]", () => {
  const t = richText()
    .begin("b", 2)
    .begin("a", 1)
    .write("123")
    .end("a")
    .end("b")
    .compose();

  it("should have text '123'", () => {
    expect(t.text).toBe("123");
  });

  it("should have annotations length 2", () => {
    expect(t.annotations).notToBe(undefined);
    expect(t.annotations!.length).toBe(2);
  });

  it("should have annotation a:1", () => {
    const a = t.annotations![1];
    expect(a.type).toBe("a");
    expect(a.data).toBe(1);
    expect(a.start).toBe(0);
    expect(a.end).toBe(3);
  });

  it("should have annotation b:2", () => {
    const a = t.annotations![0];
    expect(a.type).toBe("b");
    expect(a.data).toBe(2);
    expect(a.start).toBe(0);
    expect(a.end).toBe(3);
  });
});

describe("overlapping annotations: [a][b]12[/b]3[/a]", () => {
  const t = richText()
    .begin("a", 1)
    .begin("b", 2)
    .write("12")
    .end("b")
    .write("3")
    .end("a")
    .compose();

  it("should have text '123'", () => {
    expect(t.text).toBe("123");
  });

  it("should have annotations length 2", () => {
    expect(t.annotations).notToBe(undefined);
    expect(t.annotations!.length).toBe(2);
  });

  it("should have annotation a:1", () => {
    const a = t.annotations![0];
    expect(a.type).toBe("a");
    expect(a.data).toBe(1);
    expect(a.start).toBe(0);
    expect(a.end).toBe(3);
  });

  it("should have annotation b:2", () => {
    const a = t.annotations![1];
    expect(a.type).toBe("b");
    expect(a.data).toBe(2);
    expect(a.start).toBe(0);
    expect(a.end).toBe(2);
  });
});

describe("overlapping annotations: [a]1[b]2[/b]3[/a]", () => {
  const t = richText()
    .begin("a", 1)
    .write("1")
    .begin("b", 2)
    .write("2")
    .end("b")
    .write("3")
    .end("a")
    .compose();

  it("should have text '123'", () => {
    expect(t.text).toBe("123");
  });

  it("should have annotations length 2", () => {
    expect(t.annotations).notToBe(undefined);
    expect(t.annotations!.length).toBe(2);
  });

  it("should have annotation a:1", () => {
    const a = t.annotations![0];
    expect(a.type).toBe("a");
    expect(a.data).toBe(1);
    expect(a.start).toBe(0);
    expect(a.end).toBe(3);
  });

  it("should have annotation b:2", () => {
    const a = t.annotations![1];
    expect(a.type).toBe("b");
    expect(a.data).toBe(2);
    expect(a.start).toBe(1);
    expect(a.end).toBe(2);
  });
});

describe("overlapping annotations: [a]1[b]2[/a]3[/b]", () => {
  const t = richText()
    .begin("a", 1)
    .write("1")
    .begin("b", 2)
    .write("2")
    .end("a")
    .write("3")
    .end("b")
    .compose();

  it("should have text '123'", () => {
    expect(t.text).toBe("123");
  });

  it("should have annotations length 2", () => {
    expect(t.annotations).notToBe(undefined);
    expect(t.annotations!.length).toBe(2);
  });

  it("should have annotation a:1", () => {
    const a = t.annotations![0];
    expect(a.type).toBe("a");
    expect(a.data).toBe(1);
    expect(a.start).toBe(0);
    expect(a.end).toBe(2);
  });

  it("should have annotation b:2", () => {
    const a = t.annotations![1];
    expect(a.type).toBe("b");
    expect(a.data).toBe(2);
    expect(a.start).toBe(1);
    expect(a.end).toBe(3);
  });
});

describe("write function", () => {
  const empty = richText()
    .write((w) => w.write("123"))
    .compose();

  it("should have text '123'", () => {
    expect(empty.text).toBe("123");
  });

  it("should have null annotations", () => {
    expect(empty.annotations).toBe(undefined);
  });
});
