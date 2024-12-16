"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePostgresConnectionString = exports.databaseNameFromUrl = exports.configVarNamesFromValue = exports.bastionKeyPlan = exports.getConnectionDetails = exports.presentCredentialAttachments = exports.getConfigVarNameFromAttachment = exports.essentialPlan = exports.legacyEssentialPlan = exports.essentialNumPlan = exports.getConfigVarName = void 0;
const color_1 = require("@heroku-cli/color");
const core_1 = require("@oclif/core");
const debug_1 = require("debug");
const addons_1 = require("../../commands/addons");
const multisort_1 = require("../utils/multisort");
const bastion_1 = require("./bastion");
const process_1 = require("process");
function getConfigVarName(configVars) {
    const connStringVars = configVars.filter(cv => (cv.endsWith('_URL')));
    if (connStringVars.length === 0)
        throw new Error('Database URL not found for this addon');
    return connStringVars[0];
}
exports.getConfigVarName = getConfigVarName;
const essentialNumPlan = (addon) => { var _a, _b; return Boolean((_b = (_a = addon === null || addon === void 0 ? void 0 : addon.plan) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.split(':')[1].match(/^essential/)); };
exports.essentialNumPlan = essentialNumPlan;
const legacyEssentialPlan = (addon) => { var _a, _b; return Boolean((_b = (_a = addon === null || addon === void 0 ? void 0 : addon.plan) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.split(':')[1].match(/(dev|basic|mini)$/)); };
exports.legacyEssentialPlan = legacyEssentialPlan;
function essentialPlan(addon) {
    return (0, exports.essentialNumPlan)(addon) || (0, exports.legacyEssentialPlan)(addon);
}
exports.essentialPlan = essentialPlan;
function getConfigVarNameFromAttachment(attachment, config = {}) {
    var _a, _b;
    const configVars = (_b = (_a = attachment.config_vars) === null || _a === void 0 ? void 0 : _a.filter((cv) => {
        var _a;
        return (_a = config[cv]) === null || _a === void 0 ? void 0 : _a.startsWith('postgres://');
    })) !== null && _b !== void 0 ? _b : [];
    if (configVars.length === 0) {
        core_1.ux.error(`No config vars found for ${attachment.name}; perhaps they were removed as a side effect of ${color_1.default.cmd('heroku rollback')}? Use ${color_1.default.cmd('heroku addons:attach')} to create a new attachment and then ${color_1.default.cmd('heroku addons:detach')} to remove the current attachment.`);
    }
    const configVarName = `${attachment.name}_URL`;
    if (configVars.includes(configVarName) && configVarName in config) {
        return configVarName;
    }
    return getConfigVarName(configVars);
}
exports.getConfigVarNameFromAttachment = getConfigVarNameFromAttachment;
function presentCredentialAttachments(app, credAttachments, credentials, cred) {
    const isForeignApp = (attOrAddon) => attOrAddon.app.name === app ? 0 : 1;
    const comparators = [
        (a, b) => {
            const fa = isForeignApp(a);
            const fb = isForeignApp(b);
            return fa < fb ? -1 : (fb < fa ? 1 : 0);
        },
        (a, b) => a.name.localeCompare(b.name),
        (a, b) => { var _a, _b, _c, _d, _e; return (_e = (_b = (_a = a.app) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.localeCompare((_d = (_c = b.app) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : '')) !== null && _e !== void 0 ? _e : 0; },
    ];
    credAttachments.sort((0, multisort_1.multiSortCompareFn)(comparators));
    // render each attachment under the credential
    const attLines = credAttachments.map(function (attachment, idx) {
        const isLast = (idx === credAttachments.length - 1);
        return (0, addons_1.renderAttachment)(attachment, app, isLast);
    });
    const rotationLines = [];
    const credentialStore = credentials.find(a => a.name === cred);
    if ((credentialStore === null || credentialStore === void 0 ? void 0 : credentialStore.state) === 'rotating') {
        const formatted = credentialStore === null || credentialStore === void 0 ? void 0 : credentialStore.credentials.map(credential => {
            return {
                user: credential.user,
                state: credential.state,
                connections: credential.connections,
            };
        });
        // eslint-disable-next-line no-eq-null, eqeqeq
        const connectionInformationAvailable = formatted.some(c => c.connections != null);
        if (connectionInformationAvailable) {
            const prefix = '       ';
            rotationLines.push(`${prefix}Usernames currently active for this credential:`);
            core_1.ux.table(formatted, {
                user: {
                    get(row) {
                        return `${prefix}${row.user}`;
                    },
                },
                state: {
                    get(row) {
                        return row.state === 'revoking' ? 'waiting for no connections to be revoked' : row.state;
                    },
                },
                connections: {
                    get(row) {
                        return `${row.connections} connections`;
                    },
                },
            }, {
                'no-header': true,
                printLine(line) {
                    rotationLines.push(line);
                },
            });
        }
    }
    return [cred, ...attLines, ...rotationLines].join('\n');
}
exports.presentCredentialAttachments = presentCredentialAttachments;
const getConnectionDetails = (attachment, configVars = {}) => {
    const connStringVar = getConfigVarNameFromAttachment(attachment, configVars);
    // remove _URL from the end of the config var name
    const baseName = connStringVar.slice(0, -4);
    // build the default payload for non-bastion dbs
    (0, debug_1.default)(`Using "${connStringVar}" to connect to your database…`);
    const conn = (0, exports.parsePostgresConnectionString)(configVars[connStringVar]);
    const payload = {
        user: conn.user,
        password: conn.password,
        database: conn.database,
        host: conn.host,
        port: conn.port,
        pathname: conn.pathname,
        url: conn.url,
        attachment,
    };
    // If bastion creds exist, graft it into the payload
    const bastion = (0, bastion_1.getBastion)(configVars, baseName);
    if (bastion) {
        Object.assign(payload, bastion);
    }
    return payload;
};
exports.getConnectionDetails = getConnectionDetails;
const bastionKeyPlan = (a) => Boolean(a.plan.name.match(/private/));
exports.bastionKeyPlan = bastionKeyPlan;
const configVarNamesFromValue = (config, value) => {
    const keys = [];
    for (const key of Object.keys(config)) {
        const configVal = config[key];
        if (configVal === value) {
            keys.push(key);
        }
        else if (configVal.startsWith('postgres://')) {
            try {
                const configURL = new URL(configVal);
                const ourURL = new URL(value);
                const components = ['protocol', 'hostname', 'port', 'pathname'];
                if (components.every(component => ourURL[component] === configURL[component])) {
                    keys.push(key);
                }
            }
            catch (_a) {
                // ignore -- this is not a valid URL so not a matching URL
            }
        }
    }
    const comparator = (a, b) => {
        const isDatabaseUrlA = Number(a === 'DATABASE_URL');
        const isDatabaseUrlB = Number(b === 'DATABASE_URL');
        return isDatabaseUrlA < isDatabaseUrlB ? -1 : (isDatabaseUrlB < isDatabaseUrlA ? 1 : 0);
    };
    return keys.sort(comparator);
};
exports.configVarNamesFromValue = configVarNamesFromValue;
const databaseNameFromUrl = (uri, config) => {
    const names = (0, exports.configVarNamesFromValue)(config, uri);
    let name = names.pop();
    while (names.length > 0 && name === 'DATABASE_URL')
        name = names.pop();
    if (name) {
        return color_1.default.configVar(name.replace(/_URL$/, ''));
    }
    const conn = (0, exports.parsePostgresConnectionString)(uri);
    return `${conn.host}:${conn.port}${conn.pathname}`;
};
exports.databaseNameFromUrl = databaseNameFromUrl;
const parsePostgresConnectionString = (db) => {
    const dbPath = db.match(/:\/\//) ? db : `postgres:///${db}`;
    const url = new URL(dbPath);
    const { username, password, hostname, pathname, port } = url;
    return {
        user: username,
        password,
        database: pathname.charAt(0) === '/' ? pathname.slice(1) : pathname,
        host: hostname,
        port: port || process_1.env.PGPORT || (hostname && '5432'),
        pathname,
        url: dbPath,
    };
};
exports.parsePostgresConnectionString = parsePostgresConnectionString;
