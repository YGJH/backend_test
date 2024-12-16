"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
function getUTCDate(dateString = Date.now()) {
    const date = new Date(dateString);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
}
function default_1(date) {
    return `${(0, date_fns_1.format)(getUTCDate(date), 'yyyy-MM-dd HH:mm')} UTC`;
}
exports.default = default_1;
