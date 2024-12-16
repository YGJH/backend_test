"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nls = void 0;
const nlsValues = require("./package.nls.json");
/**
 * Non-localized strings util.
 *
 * @param key The key of the non-localized string to retrieve.
 * @return string
 */
function nls(key) {
    return nlsValues[key];
}
exports.nls = nls;
