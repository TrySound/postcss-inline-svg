import { dirname, resolve } from 'path';

export default function resolveId(file, url, opts) {
    if (opts.path) {
        return resolve(opts.path, url);
    }
    if (file) {
        return resolve(dirname(file), url);
    }
    return resolve(url);
}
