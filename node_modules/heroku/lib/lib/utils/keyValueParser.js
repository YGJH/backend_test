"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseKeyValue(input) {
    let [key, value] = input.split(/=(.+)/);
    key = key.trim();
    value = value ? value.trim() : '';
    return { key, value };
}
exports.default = parseKeyValue;
