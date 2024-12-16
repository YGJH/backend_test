"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const domains_1 = require("../../lib/certs/domains");
const inquirer_1 = require("inquirer");
const get_cert_and_key_1 = require("../../lib/certs/get_cert_and_key");
const tsheredoc_1 = require("tsheredoc");
const certificate_details_1 = require("../../lib/certs/certificate_details");
async function configureDomains(app, heroku, cert) {
    const certDomains = cert.ssl_cert.cert_domains;
    const apiDomains = await (0, domains_1.waitForDomains)(app, heroku);
    const appDomains = apiDomains === null || apiDomains === void 0 ? void 0 : apiDomains.map((domain) => domain.hostname);
    const matchedDomains = matchDomains(certDomains, appDomains !== null && appDomains !== void 0 ? appDomains : []);
    if (matchedDomains.length > 0) {
        core_1.ux.styledHeader('Almost done! Which of these domains on this application would you like this certificate associated with?');
        const selections = await (0, inquirer_1.prompt)([{
                type: 'checkbox',
                name: 'domains',
                message: 'Select domains',
                choices: matchedDomains,
            }]);
        await Promise.all(selections === null || selections === void 0 ? void 0 : selections.domains.map(domain => {
            return heroku.patch(`/apps/${app}/domains/${domain}`, {
                body: { sni_endpoint: cert.name },
            });
        }));
    }
}
class Add extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Add);
        const { app } = flags;
        const files = await (0, get_cert_and_key_1.getCertAndKey)(args);
        core_1.ux.action.start(`Adding SSL certificate to ${color_1.default.magenta(app)}`);
        const { body: sniEndpoint } = await this.heroku.post(`/apps/${app}/sni-endpoints`, {
            body: {
                certificate_chain: files.crt.toString(),
                private_key: files.key.toString(),
            },
        });
        core_1.ux.action.stop();
        (0, certificate_details_1.displayCertificateDetails)(sniEndpoint);
        await configureDomains(app, this.heroku, sniEndpoint);
    }
}
exports.default = Add;
Add.topic = 'certs';
Add.strict = true;
Add.description = `Add an SSL certificate to an app.

  Note: certificates with PEM encoding are also valid.
  `;
Add.examples = [
    (0, tsheredoc_1.default)(`$ heroku certs:add example.com.crt example.com.key
    If you require intermediate certificates, refer to this article on merging certificates to get a complete chain:
    https://help.salesforce.com/s/articleView?id=000333504&type=1`),
];
Add.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Add.args = {
    CRT: core_1.Args.string({ required: true, description: 'absolute path of the certificate file on disk' }),
    KEY: core_1.Args.string({ required: true, description: 'absolute path of the key file on disk' }),
};
function splitDomains(domains) {
    return domains.map(domain => {
        return [domain.slice(0, 1), domain.slice(1)];
    });
}
function createMatcherFromSplitDomain([firstChar, rest]) {
    const matcherContents = [];
    if (firstChar === '*') {
        matcherContents.push('^[\\w\\-]+');
    }
    else {
        matcherContents.push(firstChar);
    }
    const escapedRest = rest.replace(/\./g, '\\.');
    matcherContents.push(escapedRest);
    return new RegExp(matcherContents.join(''));
}
function matchDomains(certDomains, appDomains) {
    const splitCertDomains = splitDomains(certDomains);
    const matchers = splitCertDomains.map(splitDomain => createMatcherFromSplitDomain(splitDomain));
    if (splitCertDomains.some(domain => (domain[0] === '*'))) {
        const matchedDomains = [];
        appDomains.forEach(appDomain => {
            if (matchers.some(matcher => matcher.test(appDomain))) {
                matchedDomains.push(appDomain);
            }
        });
        return matchedDomains;
    }
    return certDomains.filter(domain => appDomains.includes(domain));
}
