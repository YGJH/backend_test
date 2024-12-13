"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const notifications_1 = require("@heroku-cli/notifications");
const core_1 = require("@oclif/core");
function default_1(subtitle, message, success = true) {
    const contentImage = path.join(__dirname, `../assets/${success ? 'success' : 'error'}.png`);
    try {
        (0, notifications_1.notify)({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            title: 'heroku cli',
            subtitle,
            message,
            contentImage,
            sound: true,
        });
    }
    catch (error) {
        core_1.ux.warn(error);
    }
}
exports.default = default_1;
