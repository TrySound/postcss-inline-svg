import { selectOne, selectAll } from "css-select";

function matchId(exp, id) {
  return exp instanceof RegExp ? exp.test(id) : Boolean(exp);
}

function removeFillAttrib(element) {
  delete element.attribs.fill;
}

export function removeFill(id, opts) {
  return dom => {
    if (matchId(opts.removeFill, id)) {
      selectAll("[fill]", dom).forEach(removeFillAttrib);
    }
  };
}

function applyParams(params) {
  return ({ attribs }) => {
    Object.keys(params).forEach(name => {
      attribs[name] = params[name];
    });
  };
}

export function applyRootParams(params) {
  return dom => {
    applyParams(params)(selectOne("svg", dom));
  };
}

export function applySelectedParams(selectors) {
  return dom => {
    const svg = selectOne("svg", dom);

    Object.keys(selectors).forEach(selector => {
      selectAll(selector, svg).forEach(applyParams(selectors[selector]));
    });
  };
}
