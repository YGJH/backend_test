"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class Index extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Index);
        const { app, space } = flags;
        let drains = [];
        if (app) {
            const { body: appTelemetryDrains } = await this.heroku.get(`/apps/${app}/telemetry-drains`, {
                headers: {
                    Accept: 'application/vnd.heroku+json; version=3.sdk',
                },
            });
            drains = appTelemetryDrains;
        }
        else if (space) {
            const { body: spaceTelemetryDrains } = await this.heroku.get(`/spaces/${space}/telemetry-drains`, {
                headers: {
                    Accept: 'application/vnd.heroku+json; version=3.sdk',
                },
            });
            drains = spaceTelemetryDrains;
        }
        this.display(drains, app || space);
    }
    display(telemetryDrains, owner) {
        if (telemetryDrains.length === 0) {
            core_1.ux.log(`There are no telemetry drains in ${owner}`);
        }
        else {
            core_1.ux.styledHeader(`${owner} Telemetry Drains`);
            core_1.ux.table(telemetryDrains, {
                ID: { get: telemetryDrain => telemetryDrain.id },
                Signals: { get: telemetryDrain => telemetryDrain.signals },
                Endpoint: { get: telemetryDrain => telemetryDrain.exporter.endpoint },
            });
        }
    }
}
exports.default = Index;
Index.topic = 'telemetry';
Index.description = 'list telemetry drains';
Index.flags = {
    space: command_1.flags.string({ char: 's', description: 'filter by space name', exactlyOne: ['app', 'space'] }),
    app: command_1.flags.app({ description: 'filter by app name' }),
};
Index.example = '$ heroku telemetry';
