"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appTransfer = void 0;
const color_1 = require("@heroku-cli/color");
const core_1 = require("@oclif/core");
const getRequestOpts = (options) => {
    const { appName, bulk, recipient, personalToPersonal } = options;
    const isPersonalToPersonal = personalToPersonal || personalToPersonal === undefined;
    const requestOpts = isPersonalToPersonal ?
        {
            body: { app: appName, recipient },
            transferMsg: `Initiating transfer of ${color_1.color.app(appName)}`,
            path: '/account/app-transfers',
            method: 'POST',
        } : {
        body: { owner: recipient },
        transferMsg: `Transferring ${color_1.color.app(appName)}`,
        path: `/teams/apps/${appName}`,
        method: 'PATCH',
    };
    if (!bulk)
        requestOpts.transferMsg += ` to ${color_1.color.magenta(recipient)}`;
    return requestOpts;
};
const appTransfer = async (options) => {
    const { body, transferMsg, path, method } = getRequestOpts(options);
    core_1.ux.action.start(transferMsg);
    const { body: request } = await options.heroku.request(path, {
        method,
        body,
    });
    const message = request.state === 'pending' ? 'email sent' : undefined;
    core_1.ux.action.stop(message);
};
exports.appTransfer = appTransfer;
