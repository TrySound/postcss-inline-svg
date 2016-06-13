import readCache from 'read-cache';
import applyData from './apply-data';
import encodeURI from './encode';

function transformDefault(result, encode) {
    // Normalize
    result = result
            .replace(/"/g, '\'')
            .replace(/\s+/g, ' ')
            .trim();

    // Encode
    if (typeof encode === 'function') {
        result = encode(result);
    } else if (encode !== false) {
        result = encodeURI(result);
    }

    return '"data:image/svg+xml;charset=utf-8,' + result + '"';
}

export default function loadSVG(path, data, opts) {
    return readCache(path, 'utf-8').then(result => {
        let transformed;
        result = applyData(result, data);

        if (typeof opts.transform === 'function') {
            transformed = opts.transform(result, path, opts);
        } else {
            transformed = transformDefault(result, opts.encode);
        }

        return transformed;
    });
}
