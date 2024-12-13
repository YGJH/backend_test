"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const core_1 = require("@oclif/core");
const command_1 = require("@heroku-cli/command");
class Remove extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Remove);
        const { app } = flags;
        core_1.ux.action.start(`Removing ${color_1.default.app(app)} from favorites`);
        const { body: favorites } = await this.heroku.get('/favorites?type=app', { hostname: 'particleboard.heroku.com' });
        const favorite = favorites.find(f => f.resource_name === app);
        if (!favorite) {
            throw new Error(`${color_1.default.app(app)} is not already a favorite app.`);
        }
        await this.heroku.delete(`/favorites/${favorite.id}`, {
            hostname: 'particleboard.heroku.com',
        });
        core_1.ux.action.stop();
    }
}
exports.default = Remove;
Remove.description = 'unfavorites an app';
Remove.topic = 'apps';
Remove.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
