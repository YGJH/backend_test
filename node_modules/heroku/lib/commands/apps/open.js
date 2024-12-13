"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const command_1 = require("@heroku-cli/command");
const open = require("open");
class AppsOpen extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(AppsOpen);
        const appResponse = await this.heroku.get(`/apps/${flags.app}`);
        const app = appResponse.body;
        const path = args.path || '';
        const url = new URL(path, app.web_url);
        await open(url.toString());
    }
}
exports.default = AppsOpen;
AppsOpen.description = 'open the app in a web browser';
AppsOpen.topic = 'apps';
AppsOpen.hiddenAliases = ['open'];
AppsOpen.examples = [
    '$ heroku open -a myapp',
    '$ heroku open -a myapp /foo',
];
AppsOpen.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
AppsOpen.args = {
    path: core_1.Args.string({ required: false, description: 'base URL path of app' }),
};
