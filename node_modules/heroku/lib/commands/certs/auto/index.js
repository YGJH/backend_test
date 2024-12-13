"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const certificate_details_1 = require("../../../lib/certs/certificate_details");
const domains_1 = require("../../../lib/domains/domains");
const date_fns_1 = require("date-fns");
const tsheredoc_1 = require("tsheredoc");
function humanize(value) {
    if (!value) {
        return color_1.default.yellow('Waiting');
    }
    if (value === 'ok') {
        return color_1.default.green('OK');
    }
    if (value === 'failed') {
        return color_1.default.red('Failed');
    }
    if (value === 'verified') {
        return color_1.default.yellow('In Progress');
    }
    if (value === 'dns-verified') {
        return color_1.default.yellow('DNS Verified');
    }
    return value.split('-')
        .map(word => word.replace(/(^[a-z])/, text => text.toUpperCase()))
        .join(' ');
}
class Index extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Index);
        const [{ body: app }, { body: sniEndpoints }] = await Promise.all([
            this.heroku.get(`/apps/${flags.app}`),
            this.heroku.get(`/apps/${flags.app}/sni-endpoints`),
        ]);
        if (!app.acm) {
            core_1.ux.styledHeader(`Automatic Certificate Management is ${color_1.default.yellow('disabled')} on ${flags.app}`);
            return;
        }
        core_1.ux.styledHeader(`Automatic Certificate Management is ${color_1.default.green('enabled')} on ${flags.app}`);
        if (sniEndpoints.length === 1 && sniEndpoints[0].ssl_cert.acm) {
            (0, certificate_details_1.displayCertificateDetails)(sniEndpoints[0]);
            core_1.ux.log('');
        }
        if (flags.wait) {
            await (0, domains_1.waitForCertIssuedOnDomains)(this.heroku, flags.app).catch(() => { });
        }
        let { body: domains } = await this.heroku.get(`/apps/${flags.app}/domains`);
        domains = domains.filter(domain => domain.kind === 'custom');
        let message;
        if (domains.length === 0) {
            message = `Add a custom domain to your app by running: ${color_1.default.cmd('heroku domains:add <yourdomain.com>')}`;
        }
        else if (domains.some(domain => domain.acm_status === 'failed')) {
            message = (0, tsheredoc_1.default) `
        Some domains failed validation after multiple attempts, retry by running: ${color_1.default.cmd('heroku certs:auto:refresh')}
            See our documentation at https://devcenter.heroku.com/articles/automated-certificate-management#failure-reasons`;
        }
        else if (domains.some(domain => domain.acm_status === 'failing')) {
            message = (0, tsheredoc_1.default) `
        Some domains are failing validation, please verify that your DNS matches: ${color_1.default.cmd('heroku domains')}
            See our documentation at https://devcenter.heroku.com/articles/automated-certificate-management#failure-reasons`;
        }
        if (domains.length > 0) {
            core_1.ux.table(domains, Object.assign(Object.assign({ Domain: {
                    get: (domain) => domain.hostname,
                }, Status: {
                    get: (domain) => humanize(domain.acm_status),
                } }, (domains.some(d => d.acm_status_reason) ? {
                Reason: {
                    get: (domain) => domain.acm_status_reason ? domain.acm_status_reason : '',
                },
            } : {})), { lastUpdated: {
                    header: 'Last Updated',
                    get: (domain) => (0, date_fns_1.formatDistanceToNow)(new Date(domain.updated_at)),
                } }));
            if (message) {
                core_1.ux.log('');
            }
        }
        if (message) {
            core_1.ux.styledHeader(message);
        }
    }
}
exports.default = Index;
Index.topic = 'certs';
Index.description = 'show ACM status for an app';
Index.flags = {
    wait: command_1.flags.boolean({ description: 'watch ACM status and display the status when complete' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
