import { parseDOM } from "htmlparser2";
import serialize from "dom-serializer";

export default function render(code, ...processors) {
  const dom = parseDOM(code, { xmlMode: true });

  processors.forEach(processor => processor(dom));

  return serialize(dom);
}
