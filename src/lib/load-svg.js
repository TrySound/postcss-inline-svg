import readCache from 'read-cache';
import applyData from './apply-data';

export default function loadSVG(id, data, opts) {
    return readCache(id, 'utf-8').then(result => {
        let code = applyData(result, data);
        if (opts.encode) {
            code = opts.encode(code);
        }
        return opts.transform(code, id);
    });
}
