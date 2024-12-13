"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const domains_1 = require("../../../lib/domains/domains");
const notify_1 = require("../../../lib/notify");
class Enable extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Enable);
        const { app, wait } = flags;
        core_1.ux.action.start('Enabling Automatic Certificate Management');
        const domainsBeforeEnable = await (0, domains_1.getDomains)(this.heroku, app);
        await this.heroku.post(`/apps/${app}/acm`, { body: {} });
        if (wait) {
            core_1.ux.action.stop(`${color_1.default.yellow('starting')}.`);
            try {
                await (0, domains_1.waitForCertIssuedOnDomains)(this.heroku, app);
                (0, notify_1.default)('heroku certs:auto:enable', 'Certificate issued to all domains');
            }
            catch (error) {
                (0, notify_1.default)('heroku certs:auto:enable', 'An error occurred', false);
                core_1.ux.styledHeader(`${color_1.default.red('Error')}: The certificate could not be issued to all domains. See status with ${color_1.default.cmd('heroku certs:auto')}.`);
                throw error;
            }
        }
        else {
            core_1.ux.action.stop(`${color_1.default.yellow('starting')}. See status with ${color_1.default.cmd('heroku certs:auto')} or wait until active with ${color_1.default.cmd('heroku certs:auto --wait')}`);
        }
        const domains = await (0, domains_1.waitForDomains)(this.heroku, app);
        const changedCnames = domains.filter(function (domain) {
            const domainBeforeEnable = domainsBeforeEnable.find(domainBefore => domain.hostname === domainBefore.hostname);
            return domainBeforeEnable && domain.cname !== domainBeforeEnable.cname;
        });
        const message = `Your certificate will now be managed by Heroku. Check the status by running ${color_1.default.cmd('heroku certs:auto')}.`;
        if (domains.length === 0 || changedCnames.length > 0) {
            (0, domains_1.printDomains)(changedCnames, message);
        }
        else {
            core_1.ux.styledHeader(message);
        }
    }
}
exports.default = Enable;
Enable.topic = 'certs';
Enable.description = 'enable ACM status for an app';
Enable.flags = {
    wait: command_1.flags.boolean({ description: 'watch ACM status and exit when complete' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
