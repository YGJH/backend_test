"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const certificate_details_1 = require("../../lib/certs/certificate_details");
const get_cert_and_key_1 = require("../../lib/certs/get_cert_and_key");
const tsheredoc_1 = require("tsheredoc");
const flags_1 = require("../../lib/certs/flags");
const confirmCommand_1 = require("../../lib/confirmCommand");
class Update extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Update);
        const { app, confirm } = flags;
        let sniEndpoint = await (0, flags_1.default)(flags, this.heroku);
        const files = await (0, get_cert_and_key_1.getCertAndKey)(args);
        await (0, confirmCommand_1.default)(app, confirm, (0, tsheredoc_1.default) `
        Potentially Destructive Action
        This command will change the certificate of endpoint ${sniEndpoint.name} from ${color_1.default.magenta(app)}.
      `);
        core_1.ux.action.start(`Updating SSL certificate ${sniEndpoint.name} for ${color_1.default.magenta(app)}`);
        ({ body: sniEndpoint } = await this.heroku.patch(`/apps/${app}/sni-endpoints/${sniEndpoint.name}`, {
            body: {
                certificate_chain: files.crt,
                private_key: files.key,
            },
        }));
        core_1.ux.action.stop();
        (0, certificate_details_1.displayCertificateDetails)(sniEndpoint, 'Updated certificate details:');
    }
}
exports.default = Update;
Update.topic = 'certs';
Update.description = (0, tsheredoc_1.default) `
    update an SSL certificate on an app
    Note: certificates with PEM encoding are also valid
  `;
Update.flags = {
    confirm: command_1.flags.string({ hidden: true }),
    name: command_1.flags.string({ description: 'name to update' }),
    endpoint: command_1.flags.string({ description: 'endpoint to update' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Update.args = {
    CRT: core_1.Args.string({ required: true, description: 'absolute path of the certificate file on disk' }),
    KEY: core_1.Args.string({ required: true, description: 'absolute path of the key file on disk' }),
};
Update.examples = [(0, tsheredoc_1.default) `
    $ heroku certs:update example.com.crt example.com.key

        If you require intermediate certificates, refer to this article on merging certificates to get a complete chain:
        https://help.salesforce.com/s/articleView?id=000333504&type=1
  `];
