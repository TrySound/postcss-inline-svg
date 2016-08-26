import { selectAll } from 'css-select';

function matchId(exp, id) {
    return exp instanceof RegExp ? exp.test(id) : Boolean(exp);
}

function removeFillAttrib(element) {
    delete element.attribs.fill;
}

export default function removeFill(id, opts) {
    return dom => {
        if (matchId(opts.removeFill, id)) {
            selectAll('[fill]', dom).forEach(removeFillAttrib);
        }
    };
}
