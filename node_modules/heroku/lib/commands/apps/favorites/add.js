"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const core_1 = require("@oclif/core");
const command_1 = require("@heroku-cli/command");
class Add extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Add);
        const { app } = flags;
        core_1.ux.action.start(`Adding ${color_1.default.app(app)} to favorites`);
        const { body: favorites } = await this.heroku.get('/favorites?type=app', { hostname: 'particleboard.heroku.com' });
        if (favorites.some(f => f.resource_name === app)) {
            throw new Error(`${color_1.default.app(app)} is already a favorite app.`);
        }
        try {
            await this.heroku.post('/favorites', {
                hostname: 'particleboard.heroku.com',
                body: { type: 'app', resource_id: app },
            });
        }
        catch (error) {
            if (error.statusCode === 404) {
                core_1.ux.error('App not found');
            }
            else {
                core_1.ux.error(error.cause);
            }
        }
        core_1.ux.action.stop();
    }
}
exports.default = Add;
Add.description = 'favorites an app';
Add.topic = 'apps';
Add.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
