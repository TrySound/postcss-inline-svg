import { selectOne, selectAll } from 'css-select';

function applyParams(params) {
    return ({ attribs }) => {
        Object.keys(params).forEach(name => {
            attribs[name] = params[name];
        });
    };
}

export function applyRootParams(params) {
    return dom => {
        applyParams(params)(selectOne('svg', dom));
    };
}

export function applySelectedParams(selectors) {
    return dom => {
        const svg = selectOne('svg', dom);

        Object.keys(selectors).forEach(selector => {
            selectAll(selector, svg).forEach(applyParams(selectors[selector]));
        });
    };
}
