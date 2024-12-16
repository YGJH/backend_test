"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCertAndKey = void 0;
const fs = require("node:fs/promises");
async function getCertAndKey(args) {
    return {
        crt: await fs.readFile(args.CRT, { encoding: 'utf-8' }),
        key: await fs.readFile(args.KEY, { encoding: 'utf-8' }),
    };
}
exports.getCertAndKey = getCertAndKey;
