"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const Path = require("path");
const https = require('https');
const bytes = require('bytes');
const progress = require('smooth-progress');
function download(url, path, opts) {
    const tty = process.stderr.isTTY && process.env.TERM !== 'dumb';
    function showProgress(rsp) {
        const bar = progress({
            tmpl: `Downloading ${path}... :bar :percent :eta :data`,
            width: 25,
            total: Number.parseInt(rsp.headers['content-length'], 10),
        });
        let total = 0;
        rsp.on('data', function (chunk) {
            total += chunk.length;
            bar.tick(chunk.length, { data: bytes(total, { decimalPlaces: 2, fixedDecimals: 2 }) });
        });
    }
    return new Promise(function (resolve, reject) {
        fs.mkdirSync(Path.dirname(path), { recursive: true });
        const file = fs.createWriteStream(path);
        https.get(url, function (rsp) {
            if (tty && opts.progress)
                showProgress(rsp);
            rsp.pipe(file)
                .on('error', reject)
                .on('close', resolve);
        });
    });
}
exports.default = download;
