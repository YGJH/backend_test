"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = void 0;
const got_1 = require("got");
const stream = function (url) {
    return new Promise(function (resolve, reject) {
        const stream = got_1.default.stream(url);
        stream.on('error', reject);
        stream.on('end', resolve);
        const piped = stream.pipe(process.stdout);
        piped.on('error', reject);
    });
};
exports.stream = stream;
