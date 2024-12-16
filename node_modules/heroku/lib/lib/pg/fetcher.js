"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelease = exports.database = exports.getAddon = exports.getAttachment = exports.all = exports.arbitraryAppDB = void 0;
const api_client_1 = require("@heroku-cli/command/lib/api-client");
const debug_1 = require("debug");
const resolve_1 = require("../addons/resolve");
const bastion_1 = require("./bastion");
const config_1 = require("./config");
const color_1 = require("@heroku-cli/color");
const util_1 = require("./util");
const pgDebug = (0, debug_1.default)('pg');
async function arbitraryAppDB(heroku, app) {
    // Since Postgres backups are tied to the app and not the add-on, but
    // we require *an* add-on to interact with, make sure that add-on is
    // attached to the right app.
    pgDebug(`fetching arbitrary app db on ${app}`);
    const { body: addons } = await heroku.get(`/apps/${app}/addons`);
    const addon = addons.find(a => { var _a, _b, _c; return ((_a = a === null || a === void 0 ? void 0 : a.app) === null || _a === void 0 ? void 0 : _a.name) === app && ((_c = (_b = a === null || a === void 0 ? void 0 : a.plan) === null || _b === void 0 ? void 0 : _b.name) === null || _c === void 0 ? void 0 : _c.startsWith('heroku-postgresql')); });
    if (!addon)
        throw new Error(`No heroku-postgresql databases on ${app}`);
    return addon;
}
exports.arbitraryAppDB = arbitraryAppDB;
function getAttachmentNamesByAddon(attachments) {
    return attachments.reduce((results, a) => {
        results[a.addon.id] = (results[a.addon.id] || []).concat(a.name);
        return results;
    }, {});
}
async function all(heroku, app_id) {
    const { uniqBy } = require('lodash');
    pgDebug(`fetching all DBs on ${app_id}`);
    const attachments = await allAttachments(heroku, app_id);
    let addons = attachments.map(a => a.addon);
    // Get the list of attachment names per addon here and add to each addon obj
    const attachmentNamesByAddon = getAttachmentNamesByAddon(attachments);
    addons = uniqBy(addons, 'id');
    addons.forEach(addon => {
        addon.attachment_names = attachmentNamesByAddon[addon.id];
    });
    return addons;
}
exports.all = all;
async function matchesHelper(heroku, app, db, namespace) {
    var _a;
    (0, debug_1.default)(`fetching ${db} on ${app}`);
    const addonService = process.env.HEROKU_POSTGRESQL_ADDON_NAME || 'heroku-postgresql';
    (0, debug_1.default)(`addon service: ${addonService}`);
    try {
        const attached = await (0, resolve_1.appAttachment)(heroku, app, db, { addon_service: addonService, namespace });
        return ({ matches: [attached] });
    }
    catch (error) {
        if (error instanceof resolve_1.AmbiguousError && ((_a = error.body) === null || _a === void 0 ? void 0 : _a.id) === 'multiple_matches' && error.matches) {
            return { matches: error.matches, error };
        }
        if (error instanceof api_client_1.HerokuAPIError && error.http.statusCode === 404 && error.body && error.body.id === 'not_found') {
            return { matches: null, error };
        }
        throw error;
    }
}
async function getAttachment(heroku, app, db = 'DATABASE_URL', namespace = '') {
    var _a;
    const matchesOrError = await matchesHelper(heroku, app, db, namespace);
    let { matches } = matchesOrError;
    const { error } = matchesOrError;
    // happy path where the resolver matches just one
    if (matches && matches.length === 1) {
        return matches[0];
    }
    // case for 404 where there are implicit attachments
    if (!matches) {
        const appConfigMatch = /^(.+?)::(.+)/.exec(db);
        if (appConfigMatch) {
            app = appConfigMatch[1];
            db = appConfigMatch[2];
        }
        if (!db.endsWith('_URL')) {
            db += '_URL';
        }
        const [config = {}, attachments] = await Promise.all([
            (0, config_1.getConfig)(heroku, app),
            allAttachments(heroku, app),
        ]);
        if (attachments.length === 0) {
            throw new Error(`${color_1.default.app(app)} has no databases`);
        }
        matches = attachments.filter(attachment => config[db] && config[db] === config[(0, util_1.getConfigVarName)(attachment.config_vars)]);
        if (matches.length === 0) {
            const validOptions = attachments.map(attachment => (0, util_1.getConfigVarName)(attachment.config_vars));
            throw new Error(`Unknown database: ${db}. Valid options are: ${validOptions.join(', ')}`);
        }
    }
    // case for multiple attachments with passedDb
    const first = matches[0];
    // case for 422 where there are ambiguous attachments that are equivalent
    if (matches.every(match => { var _a, _b, _c, _d; return ((_a = first.addon) === null || _a === void 0 ? void 0 : _a.id) === ((_b = match.addon) === null || _b === void 0 ? void 0 : _b.id) && ((_c = first.app) === null || _c === void 0 ? void 0 : _c.id) === ((_d = match.app) === null || _d === void 0 ? void 0 : _d.id); })) {
        const config = (_a = await (0, config_1.getConfig)(heroku, first.app.name)) !== null && _a !== void 0 ? _a : {};
        if (matches.every(match => config[(0, util_1.getConfigVarName)(first.config_vars)] === config[(0, util_1.getConfigVarName)(match.config_vars)])) {
            return first;
        }
    }
    throw error;
}
exports.getAttachment = getAttachment;
async function allAttachments(heroku, app_id) {
    const { body: attachments } = await heroku.get(`/apps/${app_id}/addon-attachments`, {
        headers: { 'Accept-Inclusion': 'addon:plan,config_vars' },
    });
    return attachments.filter((a) => { var _a, _b; return (_b = (_a = a.addon.plan) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.startsWith('heroku-postgresql'); });
}
async function getAddon(heroku, app, db = 'DATABASE_URL') {
    return (await getAttachment(heroku, app, db)).addon;
}
exports.getAddon = getAddon;
async function database(heroku, app, db, namespace) {
    const attached = await getAttachment(heroku, app, db, namespace);
    // would inline this as well but in some cases attachment pulls down config
    // as well, and we would request twice at the same time but I did not want
    // to push this down into attachment because we do not always need config
    const config = await (0, config_1.getConfig)(heroku, attached.app.name);
    const database = (0, util_1.getConnectionDetails)(attached, config);
    if ((0, util_1.bastionKeyPlan)(attached.addon) && !database.bastionKey) {
        const { body: bastionConfig } = await (0, bastion_1.fetchConfig)(heroku, attached.addon);
        const bastionHost = bastionConfig.host;
        const bastionKey = bastionConfig.private_key;
        Object.assign(database, { bastionHost, bastionKey });
    }
    return database;
}
exports.database = database;
async function getRelease(heroku, appName, id) {
    const { body: release } = await heroku.get(`/apps/${appName}/releases/${id}`);
    return release;
}
exports.getRelease = getRelease;
