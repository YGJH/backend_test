"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = exports.getOwner = exports.isTeamApp = void 0;
const isTeamApp = function (owner) {
    return owner ? (/@herokumanager\.com$/.test(owner)) : false;
};
exports.isTeamApp = isTeamApp;
const getOwner = function (owner) {
    if (owner && (0, exports.isTeamApp)(owner)) {
        return owner.split('@herokumanager.com')[0];
    }
    return owner;
};
exports.getOwner = getOwner;
const isValidEmail = function (email) {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
};
exports.isValidEmail = isValidEmail;
