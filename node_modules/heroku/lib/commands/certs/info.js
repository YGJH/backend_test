"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const flags_1 = require("../../lib/certs/flags");
const certificate_details_1 = require("../../lib/certs/certificate_details");
class Info extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Info);
        const { app } = flags;
        const endpoint = await (0, flags_1.default)(flags, this.heroku);
        core_1.ux.action.start(`Fetching SSL certificate ${endpoint.name} info for ${color_1.default.app(app)}`);
        // This is silly, we just fetched all SNI Endpoints and filtered to get the one we want just
        // to use the name on the start action message, but then we re-fetch the exact same SNI Endpoint we
        // already have.
        const { body: cert } = await this.heroku.get(`/apps/${app}/sni-endpoints/${endpoint.name}`);
        core_1.ux.action.stop();
        if (flags['show-domains']) {
            core_1.ux.action.start(`Fetching domains for ${endpoint.name}`);
            const domains = await Promise.all(endpoint.domains.map(async (domain) => {
                const { body: response } = await this.heroku.get(`/apps/${app}/domains/${domain}`);
                return response.hostname;
            }));
            core_1.ux.action.stop();
            cert.domains = domains;
        }
        else {
            cert.domains = [];
        }
        (0, certificate_details_1.displayCertificateDetails)(cert);
    }
}
exports.default = Info;
Info.topic = 'certs';
Info.description = 'show certificate information for an SSL certificate';
Info.flags = {
    name: command_1.flags.string({ description: 'name to check info on' }),
    endpoint: command_1.flags.string({ description: 'endpoint to check info on' }),
    'show-domains': command_1.flags.boolean({ description: 'show associated domains' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
