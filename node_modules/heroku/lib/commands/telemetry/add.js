"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const util_1 = require("../../lib/telemetry/util");
class Add extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Add);
        const { app, headers, space, signals, transport } = flags;
        const { endpoint } = args;
        let id;
        if (app) {
            const { body: herokuApp } = await this.heroku.get(`/apps/${app}`, {
                headers: { Accept: 'application/vnd.heroku+json; version=3.sdk' },
            });
            id = herokuApp.id;
        }
        else {
            const { body: herokuSpace } = await this.heroku.get(`/spaces/${space}`);
            id = herokuSpace.id;
        }
        const exporterHeaders = headers || '{}';
        const drainConfig = {
            owner: {
                type: app ? 'app' : 'space',
                id,
            },
            signals: (0, util_1.validateAndFormatSignals)(signals),
            exporter: {
                endpoint,
                type: `otlp${transport}`,
                headers: JSON.parse(exporterHeaders),
            },
        };
        const { body: drain } = await this.heroku.post('/telemetry-drains', {
            body: drainConfig,
            headers: {
                Accept: 'application/vnd.heroku+json; version=3.sdk',
            },
        });
        core_1.ux.log(`successfully added drain ${drain.exporter.endpoint}`);
    }
}
exports.default = Add;
Add.description = 'Add and configure a new telemetry drain. Defaults to collecting all telemetry unless otherwise specified.';
Add.flags = {
    app: command_1.flags.string({ char: 'a', exactlyOne: ['app', 'space'], description: 'app to add a drain to' }),
    headers: command_1.flags.string({ description: 'custom headers to configure the drain in json format' }),
    space: command_1.flags.string({ char: 's', description: 'space to add a drain to' }),
    signals: command_1.flags.string({ default: 'all', description: 'comma-delimited list of signals to collect (traces, metrics, logs). Use "all" to collect all signals.' }),
    transport: command_1.flags.string({ default: 'http', options: ['http', 'grpc'], description: 'transport protocol for the drain' }),
};
Add.args = {
    endpoint: core_1.Args.string({ required: true, description: 'drain url' }),
};
Add.example = (0, tsheredoc_1.default)(`
    Add a telemetry drain to an app to collect logs and traces:
    $ heroku telemetry:add https://my-endpoint.com --app myapp --signals logs,traces --headers '{"x-drain-example-team": "API_KEY", "x-drain-example-dataset": "METRICS_DATASET"}'
  `);
