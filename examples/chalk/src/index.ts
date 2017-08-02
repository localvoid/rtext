import { RichTextWriter, richText } from "rtext-writer";
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
    onInit: () => ({ chalk: chalk as any as chalk.ChalkChain, result: "" }),
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

const text = richText()
  .begin("color", "green")
  .write("GREEN")
  .end("color")
  .compose();

console.log(render(text));
