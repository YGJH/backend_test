"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const util_1 = require("../../lib/telemetry/util");
class Update extends command_1.Command {
    async run() {
        const { args, flags } = await this.parse(Update);
        const { telemetry_drain_id } = args;
        const { endpoint, headers, signals, transport } = flags;
        if (!(endpoint || headers || signals || transport)) {
            core_1.ux.error((0, tsheredoc_1.default)(`
        Requires either --signals, --endpoint, --transport or HEADERS to be provided.
        See more help with --help
      `));
        }
        const drainConfig = {};
        if (signals) {
            drainConfig.signals = (0, util_1.validateAndFormatSignals)(signals);
        }
        if (headers || endpoint || transport) {
            const exporter = {};
            if (headers) {
                exporter.headers = JSON.parse(headers);
            }
            if (endpoint) {
                exporter.endpoint = endpoint;
            }
            if (transport) {
                exporter.type = `otlp${transport}`;
            }
            drainConfig.exporter = exporter;
        }
        core_1.ux.action.start(`Updating telemetry drain ${telemetry_drain_id}`);
        const { body: telemetryDrain } = await this.heroku.patch(`/telemetry-drains/${telemetry_drain_id}`, {
            headers: {
                Accept: 'application/vnd.heroku+json; version=3.sdk',
            },
            body: drainConfig,
        });
        core_1.ux.action.stop();
        (0, util_1.displayTelemetryDrain)(telemetryDrain);
    }
}
exports.default = Update;
Update.topic = 'telemetry';
Update.description = 'updates a telemetry drain with provided attributes (attributes not provided remain unchanged)';
Update.args = {
    telemetry_drain_id: core_1.Args.string({ required: true, description: 'ID of the drain to update' }),
};
Update.flags = {
    endpoint: command_1.flags.string({ description: 'drain url' }),
    headers: command_1.flags.string({ description: 'custom headers to configure the drain in json format' }),
    signals: command_1.flags.string({ description: 'comma-delimited list of signals to collect (traces, metrics, logs). Use "all" to collect all signals.' }),
    transport: command_1.flags.string({ options: ['http', 'grpc'], description: 'transport protocol for the drain' }),
};
Update.example = (0, tsheredoc_1.default)(`
    $ heroku telemetry:update acde070d-8c4c-4f0d-9d8a-162843c10333 --signals logs,metrics --endpoint https://my-new-endpoint.com
  `);
