"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const lodash_1 = require("lodash");
const inquirer = require("inquirer");
const teamUtils_1 = require("../../lib/teamUtils");
const lock_1 = require("./lock");
const app_transfer_1 = require("../../lib/apps/app-transfer");
const confirmCommand_1 = require("../../lib/confirmCommand");
function getAppsToTransfer(apps) {
    return inquirer.prompt([{
            type: 'checkbox',
            name: 'choices',
            pageSize: 20,
            message: 'Select applications you would like to transfer',
            choices: apps.map(function (app) {
                var _a, _b;
                return {
                    name: `${app.name} (${(0, teamUtils_1.getOwner)((_a = app.owner) === null || _a === void 0 ? void 0 : _a.email)})`, value: { name: app.name, owner: (_b = app.owner) === null || _b === void 0 ? void 0 : _b.email },
                };
            }),
        }]);
}
class AppsTransfer extends command_1.Command {
    async run() {
        var _a, _b, _c, _d;
        const { flags, args } = await this.parse(AppsTransfer);
        const { app, bulk, locked, confirm } = flags;
        const recipient = args.recipient;
        if (bulk) {
            const { body: allApps } = await this.heroku.get('/apps');
            const selectedApps = await getAppsToTransfer((0, lodash_1.sortBy)(allApps, 'name'));
            core_1.ux.warn(`Transferring applications to ${color_1.default.magenta(recipient)}...\n`);
            for (const app of selectedApps.choices) {
                try {
                    await (0, app_transfer_1.appTransfer)({
                        heroku: this.heroku,
                        appName: app.name,
                        recipient: recipient,
                        personalToPersonal: (0, teamUtils_1.isValidEmail)(recipient) && !(0, teamUtils_1.isTeamApp)(app.owner),
                        bulk: true,
                    });
                }
                catch (error) {
                    const { message } = error;
                    core_1.ux.error(message);
                }
            }
        }
        else {
            const { body: appInfo } = await this.heroku.get(`/apps/${app}`);
            const appName = (_b = (_a = appInfo.name) !== null && _a !== void 0 ? _a : app) !== null && _b !== void 0 ? _b : '';
            if ((0, teamUtils_1.isValidEmail)(recipient) && (0, teamUtils_1.isTeamApp)((_c = appInfo.owner) === null || _c === void 0 ? void 0 : _c.email)) {
                await (0, confirmCommand_1.default)(appName, confirm, 'All collaborators will be removed from this app');
            }
            await (0, app_transfer_1.appTransfer)({
                heroku: this.heroku,
                appName,
                recipient,
                personalToPersonal: (0, teamUtils_1.isValidEmail)(recipient) && !(0, teamUtils_1.isTeamApp)((_d = appInfo.owner) === null || _d === void 0 ? void 0 : _d.email),
                bulk,
            });
            if (locked) {
                await lock_1.default.run(['--app', appName], this.config);
            }
        }
    }
}
exports.default = AppsTransfer;
AppsTransfer.topic = 'apps';
AppsTransfer.description = 'transfer applications to another user or team';
AppsTransfer.flags = {
    locked: command_1.flags.boolean({ char: 'l', required: false, description: 'lock the app upon transfer' }),
    bulk: command_1.flags.boolean({ required: false, description: 'transfer applications in bulk' }),
    app: command_1.flags.app(),
    remote: command_1.flags.remote({ char: 'r' }),
    confirm: command_1.flags.string({ char: 'c', hidden: true }),
};
AppsTransfer.args = {
    recipient: core_1.Args.string({ description: 'user or team to transfer applications to', required: true }),
};
AppsTransfer.examples = [`$ heroku apps:transfer collaborator@example.com
Transferring example to collaborator@example.com... done

$ heroku apps:transfer acme-widgets
Transferring example to acme-widgets... done

$ heroku apps:transfer --bulk acme-widgets
...`];
