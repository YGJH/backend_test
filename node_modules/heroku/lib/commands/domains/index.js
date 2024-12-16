"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const color_1 = require("@heroku-cli/color");
const core_1 = require("@oclif/core");
const Uri = require("urijs");
const prompts_1 = require("@inquirer/prompts");
const paginator_1 = require("../../lib/utils/paginator");
const keyValueParser_1 = require("../../lib/utils/keyValueParser");
function isApexDomain(hostname) {
    if (hostname.includes('*'))
        return false;
    const a = new Uri({ protocol: 'http', hostname });
    return a.subdomain() === '';
}
class DomainsIndex extends command_1.Command {
    constructor() {
        super(...arguments);
        this.tableConfig = (needsEndpoints) => {
            const tableConfig = {
                hostname: {
                    header: 'Domain Name',
                },
                kind: {
                    header: 'DNS Record Type',
                    get: (domain) => {
                        if (domain.hostname) {
                            return isApexDomain(domain.hostname) ? 'ALIAS or ANAME' : 'CNAME';
                        }
                    },
                },
                cname: { header: 'DNS Target' },
                acm_status: { header: 'ACM Status', extended: true },
                acm_status_reason: { header: 'ACM Status', extended: true },
            };
            const sniConfig = {
                sni_endpoint: {
                    header: 'SNI Endpoint',
                    get: (domain) => {
                        if (domain.sni_endpoint) {
                            return domain.sni_endpoint.name;
                        }
                    },
                },
            };
            if (needsEndpoints) {
                return Object.assign(Object.assign({}, tableConfig), sniConfig);
            }
            return tableConfig;
        };
        this.getFilteredDomains = (filterKeyValue, domains) => {
            const filteredInfo = { size: 0, filteredDomains: domains };
            const { key: filterName, value } = (0, keyValueParser_1.default)(filterKeyValue);
            if (!value) {
                throw new Error('Filter flag has an invalid value');
            }
            if (filterName === 'Domain Name') {
                filteredInfo.filteredDomains = domains.filter(domain => domain.hostname.includes(value));
            }
            if (filterName === 'DNS Record Type') {
                filteredInfo.filteredDomains = domains.filter(domain => {
                    const kind = isApexDomain(domain.hostname) ? 'ALIAS or ANAME' : 'CNAME';
                    return kind.includes(value);
                });
            }
            if (filterName === 'DNS Target') {
                filteredInfo.filteredDomains = domains.filter(domain => domain.cname.includes(value));
            }
            if (filterName === 'SNI Endpoint') {
                filteredInfo.filteredDomains = domains.filter(domain => {
                    if (!domain.sni_endpoint)
                        domain.sni_endpoint = '';
                    return domain.sni_endpoint.includes(value);
                });
            }
            filteredInfo.size = filteredInfo.filteredDomains.length;
            return filteredInfo;
        };
    }
    async run() {
        const { flags } = await this.parse(DomainsIndex);
        const domains = await (0, paginator_1.paginateRequest)(this.heroku, `/apps/${flags.app}/domains`, 1000);
        const herokuDomain = domains.find((domain) => domain.kind === 'heroku');
        let customDomains = domains.filter((domain) => domain.kind === 'custom');
        let displayTotalDomains = false;
        if (flags.filter) {
            customDomains = this.getFilteredDomains(flags.filter, domains).filteredDomains;
        }
        if (flags.json) {
            core_1.ux.styledJSON(domains);
        }
        else {
            core_1.ux.styledHeader(`${flags.app} Heroku Domain`);
            core_1.ux.log(herokuDomain && herokuDomain.hostname);
            if (customDomains && customDomains.length > 0) {
                core_1.ux.log();
                if (customDomains.length > 100 && !flags.csv) {
                    core_1.ux.warn(`This app has over 100 domains. Your terminal may not be configured to display the total amount of domains. You can export all domains into a CSV file with: ${color_1.default.cyan('heroku domains -a example-app --csv > example-file.csv')}`);
                    displayTotalDomains = await (0, prompts_1.confirm)({ default: false, message: `Display all ${customDomains.length} domains?`, theme: { prefix: '', style: { defaultAnswer: () => '(Y/N)' } } });
                    if (!displayTotalDomains) {
                        return;
                    }
                }
                core_1.ux.log();
                core_1.ux.styledHeader(`${flags.app} Custom Domains`);
                core_1.ux.table(customDomains, this.tableConfig(true), Object.assign(Object.assign({}, flags), { 'no-truncate': true }));
            }
        }
    }
}
exports.default = DomainsIndex;
DomainsIndex.description = 'list domains for an app';
DomainsIndex.examples = [
    `$ heroku domains
=== example Heroku Domain
example-xxxxxxxxxxxx.herokuapp.com

=== example Custom Domains
Domain Name      DNS Record Type  DNS Target
www.example.com  CNAME            www.example.herokudns.com
`, "$ heroku domains --filter 'Domain Name=www.example.com'",
];
DomainsIndex.flags = Object.assign({ help: command_1.flags.help({ char: 'h' }), app: command_1.flags.app({ required: true }), remote: command_1.flags.remote(), json: command_1.flags.boolean({ description: 'output in json format', char: 'j' }) }, core_1.ux.table.flags({ except: 'no-truncate' }));
