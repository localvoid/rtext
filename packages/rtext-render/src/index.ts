import { RichTextAnnotation, RichText } from "rtext";

export interface RichTextRendererHooks<C, R> {
  onInit(): C;
  onEnter(annotation: RichTextAnnotation, context: C): C;
  onExit(annotation: RichTextAnnotation, context: C, parentContext: C): void;
  onText(text: string, context: C): void;
  onResult(context: C): R;
}

export function createRichTextRenderer<C, R>(
  priorities: { [key: string]: number },
  hooks: RichTextRendererHooks<C, R>,
): (richText: RichText) => R {
  const onInit = hooks.onInit;
  const onEnter = hooks.onEnter;
  const onExit = hooks.onExit;
  const onText = hooks.onText;
  const onResult = hooks.onResult;

  return function (richText: RichText): R {
    const rootContext = onInit();
    const text = richText.text;
    let context = rootContext;
    if (richText.annotations === undefined) {
      onText(text, context);
    } else {
      const edges = extractAnnotationEdges(priorities, richText.annotations);
      let pcontext;
      let position = 0;
      let currentStackFrame: StackFrame<C> | null = null;

      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        if (edge.position > position) {
          onText(text.substring(position, edge.position), context);
          position = edge.position;
        }

        let restoreStackFrame: StackFrame<C> | null = null;
        let parent: StackFrame<C> | null;
        if (edge.opener === null) { // Enter
          while (currentStackFrame !== null && currentStackFrame.edge.priority < edge.priority) {
            const innerEdge = currentStackFrame.edge;
            pcontext = currentStackFrame.context;
            parent = currentStackFrame.parent;
            currentStackFrame.parent = restoreStackFrame;
            restoreStackFrame = currentStackFrame;
            currentStackFrame = parent;
            context = currentStackFrame === null ? rootContext : currentStackFrame.context;
            onExit(innerEdge.annotation, context, pcontext);
          }

          context = onEnter(edge.annotation, context);
          currentStackFrame = createStackFrame(currentStackFrame, edge, context);
        } else { // Exit
          while (currentStackFrame!.edge !== edge.opener) {
            const innerEdge = currentStackFrame!.edge;
            pcontext = currentStackFrame!.context;
            parent = currentStackFrame!.parent;
            currentStackFrame!.parent = restoreStackFrame;
            restoreStackFrame = currentStackFrame;
            currentStackFrame = parent;
            context = currentStackFrame!.context;
            onExit(innerEdge.annotation, context, pcontext);
          }
          pcontext = currentStackFrame!.context;
          currentStackFrame = currentStackFrame!.parent;
          context = currentStackFrame === null ? rootContext : currentStackFrame.context;
          onExit(edge.annotation, pcontext, context);
        }

        while (restoreStackFrame !== null) {
          const next = restoreStackFrame.parent;
          context = onEnter(restoreStackFrame.edge.annotation, context);
          restoreStackFrame.context = context;
          restoreStackFrame.parent = currentStackFrame;
          currentStackFrame = restoreStackFrame;
          restoreStackFrame = next;
        }
      }
      if (position < text.length) {
        onText((position === 0) ? text : text.substring(position), context);
      }
    }
    return onResult(context);
  };
}

interface AnnotationEdge {
  opener: AnnotationEdge | null;
  position: number;
  priority: number;
  id: number;
  annotation: RichTextAnnotation;
}

interface StackFrame<C> {
  parent: StackFrame<C> | null;
  edge: AnnotationEdge;
  context: C;
}

function createStackFrame<C>(
  parent: StackFrame<C> | null,
  edge: AnnotationEdge,
  context: C,
): StackFrame<C> {
  return { parent, edge, context };
}

function extractAnnotationEdges(
  priorities: { [key: string]: number },
  annotations: RichTextAnnotation[],
): AnnotationEdge[] {
  const result: AnnotationEdge[] = [];
  for (let i = 0; i < annotations.length; i++) {
    const a = annotations[i];
    const priority = priorities[a.type];

    // Ignore unregistered annotations
    if (priority !== undefined) {
      const opener = {
        opener: null,
        position: a.start,
        priority: priority,
        id: i,
        annotation: a,
      };
      result.push(opener);
      result.push({
        opener: opener,
        position: a.end,
        priority: priority,
        id: i,
        annotation: a,
      });
    }
  }

  if (result.length > 0) {
    result.sort(compareEdges);
    return result;
  }

  return [];
}

function compareEdges(a: AnnotationEdge, b: AnnotationEdge): number {
  if (a.position < b.position) {
    return -1;
  }
  if (a.position > b.position) {
    return 1;
  }
  if (a.opener === null) {
    if (b.opener !== null) {
      return 1;
    }
    if (a.priority > b.priority) {
      return -1;
    }
    if (a.priority < b.priority) {
      return 1;
    }
    if (a.id < b.id) {
      return -1;
    }
    if (a.id > b.id) {
      return 1;
    }
  } else {
    if (b.opener === null) {
      return -1;
    }
    if (a.priority < b.priority) {
      return -1;
    }
    if (a.priority > b.priority) {
      return 1;
    }
    if (a.id > b.id) {
      return -1;
    }
    if (a.id < b.id) {
      return 1;
    }
  }
  return 0;
}
