import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

export default function resolveId(file, url, opts) {
    let paths = [];
    if (opts.path) {
        paths.push(opts.path);
    }
    if (opts.paths) {
        paths = paths.concat(opts.paths);
    }
    if (paths.length) {
        let absPath;
        for (let path of paths) {
            absPath = resolve(path, url);
            if (existsSync(absPath)) {
                return absPath;
            }
        }
        return absPath;
    }
    if (file) {
        return resolve(dirname(file), url);
    }
    return resolve(url);
}
