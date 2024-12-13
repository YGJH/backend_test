"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForCertIssuedOnDomains = exports.printDomains = exports.waitForDomains = exports.getDomains = void 0;
const psl_1 = require("psl");
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const wait = function (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
};
function isParseError(parsed) {
    return parsed.error !== undefined;
}
async function getDomains(heroku, app) {
    const { body: domains } = await heroku.get(`/apps/${app}/domains`);
    return domains;
}
exports.getDomains = getDomains;
function type(domain) {
    const parsed = (0, psl_1.parse)(domain.hostname);
    if (isParseError(parsed)) {
        throw new Error(parsed.error.message);
    }
    return parsed.subdomain === null ? 'ALIAS/ANAME' : 'CNAME';
}
async function waitForDomains(heroku, app) {
    function someNull(domains) {
        return domains.some(domain => domain.kind === 'custom' && !domain.cname);
    }
    let apiDomains = await getDomains(heroku, app);
    if (someNull(apiDomains)) {
        core_1.ux.action.start('Waiting for stable domains to be created');
        let index = 0;
        do {
            // trying 30 times was easier for me to test that setTimeout
            if (index >= 30) {
                throw new Error('Timed out while waiting for stable domains to be created');
            }
            await wait(1000);
            apiDomains = await getDomains(heroku, app);
            index++;
        } while (someNull(apiDomains));
    }
    return apiDomains;
}
exports.waitForDomains = waitForDomains;
function printDomains(domains, message) {
    domains = domains.filter(domain => domain.kind === 'custom');
    const domains_with_type = domains.map(domain => Object.assign({}, domain, { type: type(domain) }));
    if (domains_with_type.length === 0) {
        core_1.ux.styledHeader(`${message}  Add a custom domain to your app by running ${color_1.default.cmd('heroku domains:add <yourdomain.com>')}`);
    }
    else {
        core_1.ux.styledHeader(`${message}  Update your application's DNS settings as follows`);
        core_1.ux.table(domains_with_type, {
            domain: {
                get: ({ hostname }) => hostname,
            },
            recordType: {
                header: 'Record Type',
                get: ({ type }) => type,
            },
            dnsTarget: {
                header: 'DNS Target',
                get: ({ cname }) => cname,
            },
        });
    }
}
exports.printDomains = printDomains;
async function waitForCertIssuedOnDomains(heroku, app) {
    function certIssuedOrFailedForAllCustomDomains(domains) {
        domains = domains.filter(domain => domain.kind === 'custom');
        return domains.every(domain => domain.acm_status === 'cert issued' || domain.acm_status === 'failed');
    }
    function someFailed(domains) {
        domains = domains.filter(domain => domain.kind === 'custom');
        return domains.some(domain => domain.acm_status === 'failed');
    }
    function backoff(attempts) {
        const wait = 15 * 1000;
        // Don't wait more than 60 seconds
        const multiplier = attempts < 60 ? Math.floor(attempts / 20) : 3;
        const extraWait = wait * multiplier;
        return wait + extraWait;
    }
    let domains = await getDomains(heroku, app);
    if (!certIssuedOrFailedForAllCustomDomains(domains)) {
        core_1.ux.action.start('Waiting until the certificate is issued to all domains');
        let retries = 0;
        while (!certIssuedOrFailedForAllCustomDomains(domains)) {
            await wait(backoff(retries));
            domains = await getDomains(heroku, app);
            retries++;
        }
        if (someFailed(domains)) {
            core_1.ux.action.stop(color_1.default.red('!'));
            throw new Error('ACM not enabled for some domains');
        }
        core_1.ux.action.stop();
    }
}
exports.waitForCertIssuedOnDomains = waitForCertIssuedOnDomains;
