"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
class Remove extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(Remove);
        const { app, space } = flags;
        const { telemetry_drain_id } = args;
        if (!(app || space || telemetry_drain_id)) {
            core_1.ux.error((0, tsheredoc_1.default)(`
        Requires either --app or --space or a TELEMETRY_DRAIN_ID to be provided.
        See more help with --help
      `));
        }
        if (telemetry_drain_id) {
            core_1.ux.action.start(`Removing telemetry drain ${telemetry_drain_id}`);
            await this.removeDrain(telemetry_drain_id);
        }
        else if (app) {
            core_1.ux.action.start(`Removing all telemetry drains from app ${app}`);
            const { body: telemetryDrains } = await this.heroku.get(`/apps/${app}/telemetry-drains`, {
                headers: {
                    Accept: 'application/vnd.heroku+json; version=3.sdk',
                },
            });
            for (const telemetryDrain of telemetryDrains) {
                await this.removeDrain(telemetryDrain.id);
            }
        }
        else if (space) {
            core_1.ux.action.start(`Removing all telemetry drains from space ${space}`);
            const { body: telemetryDrains } = await this.heroku.get(`/spaces/${space}/telemetry-drains`, {
                headers: {
                    Accept: 'application/vnd.heroku+json; version=3.sdk',
                },
            });
            for (const telemetryDrain of telemetryDrains) {
                await this.removeDrain(telemetryDrain.id);
            }
        }
        core_1.ux.action.stop();
    }
    async removeDrain(telemetry_drain_id) {
        const { body: telemetryDrain } = await this.heroku.delete(`/telemetry-drains/${telemetry_drain_id}`, {
            headers: {
                Accept: 'application/vnd.heroku+json; version=3.sdk',
            },
        });
        return telemetryDrain;
    }
}
exports.default = Remove;
Remove.topic = 'telemetry';
Remove.description = 'remove a telemetry drain';
Remove.args = {
    telemetry_drain_id: core_1.Args.string({ description: 'ID of the drain to remove' }),
};
Remove.flags = {
    app: command_1.flags.app({ description: 'name of the app to remove all drains from' }),
    space: command_1.flags.string({ char: 's', description: 'name of the space to remove all drains from' }),
};
