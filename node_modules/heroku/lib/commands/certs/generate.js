"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const node_child_process_1 = require("node:child_process");
const inquirer = require("inquirer");
function getCommand(certs, domain) {
    const shouldUpdate = certs
        .map(cert => { var _a; return (_a = cert === null || cert === void 0 ? void 0 : cert.ssl_cert) === null || _a === void 0 ? void 0 : _a.cert_domains; })
        .filter(certDomains => certDomains === null || certDomains === void 0 ? void 0 : certDomains.length)
        .flat()
        .includes(domain);
    return shouldUpdate ? 'update' : 'add';
}
class Generate extends command_1.Command {
    constructor() {
        super(...arguments);
        this.parsed = this.parse(Generate);
    }
    async run() {
        const { flags, args } = await this.parsed;
        const { app, selfsigned } = flags;
        if (this.requiresPrompt(flags)) {
            const { owner, country, area, city } = await inquirer.prompt([
                { type: 'input', message: 'Owner of this certificate', name: 'owner' },
                { type: 'input', message: 'Country of owner (two-letter ISO code)', name: 'country' },
                { type: 'input', message: 'State/province/etc. of owner', name: 'area' },
                { type: 'input', message: 'City of owner', name: 'city' },
            ]);
            Object.assign(flags, { owner, country, area, city });
        }
        const subject = this.getSubject(args, flags);
        const domain = args.domain;
        const keysize = flags.keysize || 2048;
        const keyfile = `${domain}.key`;
        const { body: certs } = await this.heroku.get(`/apps/${app}/sni-endpoints`);
        const command = getCommand(certs, domain);
        if (selfsigned) {
            const crtfile = `${domain}.crt`;
            await this.spawnOpenSSL(['req', '-new', '-newkey', `rsa:${keysize}`, '-nodes', '-keyout', keyfile, '-out', crtfile, '-subj', subject, '-x509']);
            console.error('Your key and self-signed certificate have been generated.');
            console.error('Next, run:');
            console.error(`$ heroku certs:${command} ${crtfile} ${keyfile}`);
        }
        else {
            const csrfile = `${domain}.csr`;
            await this.spawnOpenSSL(['req', '-new', '-newkey', `rsa:${keysize}`, '-nodes', '-keyout', keyfile, '-out', csrfile, '-subj', subject]);
            console.error('Your key and certificate signing request have been generated.');
            console.error(`Submit the CSR in '${csrfile}' to your preferred certificate authority.`);
            console.error('When you\'ve received your certificate, run:');
            console.error(`$ heroku certs:${command} CERTFILE ${keyfile}`);
        }
    }
    requiresPrompt(flags) {
        if (flags.subject) {
            return false;
        }
        const args = [flags.owner, flags.country, flags.area, flags.city];
        if (!flags.now && args.every((arg) => !arg)) {
            return true;
        }
    }
    getSubject(args, flags) {
        const { domain } = args;
        const { owner, country, area, city, subject } = flags;
        if (subject) {
            return subject;
        }
        let constructedSubject = '';
        if (country) {
            constructedSubject += `/C=${country}`;
        }
        if (area) {
            constructedSubject += `/ST=${area}`;
        }
        if (city) {
            constructedSubject += `/L=${city}`;
        }
        if (owner) {
            constructedSubject += `/O=${owner}`;
        }
        constructedSubject += `/CN=${domain}`;
        return constructedSubject;
    }
    async spawnOpenSSL(args) {
        return new Promise((resolve, reject) => {
            const process = (0, node_child_process_1.spawn)('openssl', args, { stdio: 'inherit' });
            process.once('error', reject);
            process.once('close', (code) => code ? reject(new Error(`Non zero openssl error ${code}`)) : resolve(code));
        });
    }
}
exports.default = Generate;
Generate.topic = 'certs';
Generate.description = 'generate a key and a CSR or self-signed certificate';
Generate.help = 'Generate a key and certificate signing request (or self-signed certificate)\nfor an app. Prompts for information to put in the certificate unless --now\nis used, or at least one of the --subject, --owner, --country, --area, or\n--city options is specified.';
Generate.flags = {
    selfsigned: command_1.flags.boolean({ required: false, description: 'generate a self-signed certificate instead of a CSR' }),
    keysize: command_1.flags.string({ optional: true, description: 'RSA key size in bits (default: 2048)' }),
    owner: command_1.flags.string({ optional: true, description: 'name of organization certificate belongs to' }),
    country: command_1.flags.string({ optional: true, description: 'country of owner, as a two-letter ISO country code' }),
    area: command_1.flags.string({ optional: true, description: 'sub-country area (state, province, etc.) of owner' }),
    city: command_1.flags.string({ optional: true, description: 'city of owner' }),
    subject: command_1.flags.string({ optional: true, description: 'specify entire certificate subject' }),
    now: command_1.flags.boolean({ required: false, description: 'do not prompt for any owner information' }),
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
Generate.args = {
    domain: core_1.Args.string({ required: true, description: 'domain name to generate' }),
};
