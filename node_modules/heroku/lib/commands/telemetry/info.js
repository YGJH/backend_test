"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const util_1 = require("../../lib/telemetry/util");
class Info extends command_1.Command {
    async run() {
        const { args } = await this.parse(Info);
        const { telemetry_drain_id } = args;
        const { body: telemetryDrain } = await this.heroku.get(`/telemetry-drains/${telemetry_drain_id}`, {
            headers: {
                Accept: 'application/vnd.heroku+json; version=3.sdk',
            },
        });
        (0, util_1.displayTelemetryDrain)(telemetryDrain);
    }
}
exports.default = Info;
Info.topic = 'telemetry';
Info.description = 'show a telemetry drain\'s info';
Info.args = {
    telemetry_drain_id: core_1.Args.string({ required: true, description: 'ID of the drain to show info for' }),
};
Info.example = '$ heroku telemetry:info 022e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e';
