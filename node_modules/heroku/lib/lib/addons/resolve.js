"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmbiguousError = exports.NotFound = exports.resolveAddon = exports.attachmentResolver = exports.appAttachment = exports.addonResolver = exports.appAddon = void 0;
const http_call_1 = require("http-call");
const api_client_1 = require("@heroku-cli/command/lib/api-client");
const addonHeaders = {
    Accept: 'application/vnd.heroku+json; version=3.actions',
    'Accept-Expansion': 'addon_service,plan',
};
const appAddon = async function (heroku, app, id, options = {}) {
    const response = await heroku.post('/actions/addons/resolve', {
        headers: addonHeaders,
        body: { app: app, addon: id, addon_service: options.addon_service },
    });
    return singularize('addon', options.namespace)(response === null || response === void 0 ? void 0 : response.body);
};
exports.appAddon = appAddon;
const handleNotFound = function (err, resource) {
    if (err.statusCode === 404 && err.body && err.body.resource === resource) {
        return true;
    }
    throw err;
};
const addonResolver = async (heroku, app, id, options) => {
    const getAddon = async (addonId) => {
        const response = await heroku.post('/actions/addons/resolve', {
            headers: addonHeaders,
            body: { app: null, addon: addonId, addon_service: options === null || options === void 0 ? void 0 : options.addon_service },
        });
        return singularize('addon', (options === null || options === void 0 ? void 0 : options.namespace) || '')(response === null || response === void 0 ? void 0 : response.body);
    };
    if (!app || id.includes('::')) {
        return getAddon(id);
    }
    try {
        return await (0, exports.appAddon)(heroku, app, id, options);
    }
    catch (error) {
        if (error instanceof http_call_1.HTTPError && handleNotFound(error, 'add_on')) {
            return getAddon(id);
        }
        throw error;
    }
};
exports.addonResolver = addonResolver;
// -----------------------------------------------------
// Attachment resolver functions
// originating from `packages/addons-v5/lib/resolve.js`
// -----------------------------------------------------
const filter = function (app, addonService) {
    return (attachments) => {
        return attachments.filter(attachment => {
            var _a, _b;
            if (((_a = attachment === null || attachment === void 0 ? void 0 : attachment.app) === null || _a === void 0 ? void 0 : _a.name) !== app) {
                return false;
            }
            return !(addonService && ((_b = attachment === null || attachment === void 0 ? void 0 : attachment.addon_service) === null || _b === void 0 ? void 0 : _b.name) !== addonService);
        });
    };
};
const attachmentHeaders = {
    Accept: 'application/vnd.heroku+json; version=3.actions',
    'Accept-Inclusion': 'addon:plan,config_vars',
};
const appAttachment = async (heroku, app, id, options = {}) => {
    const result = await heroku.post('/actions/addon-attachments/resolve', {
        headers: attachmentHeaders, body: { app, addon_attachment: id, addon_service: options.addon_service },
    });
    return singularize('addon_attachment', options.namespace)(result.body);
};
exports.appAttachment = appAttachment;
const attachmentResolver = async (heroku, app, id, options = {}) => {
    async function getAttachment(id) {
        try {
            const result = await heroku.post('/actions/addon-attachments/resolve', {
                headers: attachmentHeaders, body: { app: null, addon_attachment: id, addon_service: options.addon_service },
            });
            return singularize('addon_attachment', options.namespace || '')(result.body);
        }
        catch (error) {
            if (error instanceof api_client_1.HerokuAPIError) {
                handleNotFound(error.http, 'add_on attachment');
            }
        }
    }
    async function getAppAddonAttachment(addon, app) {
        var _a;
        try {
            const result = await heroku.get(`/addons/${encodeURIComponent((_a = addon.id) !== null && _a !== void 0 ? _a : '')}/addon-attachments`, { headers: attachmentHeaders });
            const matches = filter(app, options.addon_service)(result.body);
            return singularize('addon_attachment', options.namespace)(matches);
        }
        catch (error) {
            const err = error instanceof api_client_1.HerokuAPIError ? error.http : error;
            handleNotFound(err, 'add_on attachment');
        }
    }
    // first check to see if there is an attachment matching this app/id combo
    try {
        const attachment = await (!app || id.includes('::') ? getAttachment(id) : (0, exports.appAttachment)(heroku, app, id, options));
        if (attachment) {
            return attachment;
        }
    }
    catch (_a) { }
    // if no attachment, look up an add-on that matches the id
    // If we were passed an add-on slug, there still could be an attachment
    // to the context app. Try to find and use it so `context_app` is set
    // correctly in the SSO payload.
    if (app) {
        try {
            const addon = await resolveAddon(heroku, app, id, options);
            return await getAppAddonAttachment(addon, app);
        }
        catch (error) {
            const err = error instanceof api_client_1.HerokuAPIError ? error.http : error;
            handleNotFound(err, 'add_on attachment');
        }
    }
};
exports.attachmentResolver = attachmentResolver;
// -----------------------------------------------------
// END
// -----------------------------------------------------
const addonResolverMap = new Map();
async function resolveAddon(...args) {
    var _a;
    const [, app, id, options] = args;
    const key = `${app}|${id}|${(_a = options === null || options === void 0 ? void 0 : options.addon_service) !== null && _a !== void 0 ? _a : ''}`;
    const promise = addonResolverMap.get(key) || (0, exports.addonResolver)(...args);
    try {
        await promise;
        addonResolverMap.has(key) || addonResolverMap.set(key, promise);
    }
    catch (_b) {
        addonResolverMap.delete(key);
    }
    return promise;
}
exports.resolveAddon = resolveAddon;
resolveAddon.cache = addonResolverMap;
class NotFound extends Error {
    constructor() {
        super(...arguments);
        this.statusCode = 404;
        this.id = 'not_found';
        this.message = 'Couldn\'t find that addon.';
    }
}
exports.NotFound = NotFound;
class AmbiguousError extends Error {
    constructor(matches, type) {
        super();
        this.matches = matches;
        this.type = type;
        this.statusCode = 422;
        this.body = { id: 'multiple_matches', message: this.message };
        this.message = `Ambiguous identifier; multiple matching add-ons found: ${matches.map(match => match.name).join(', ')}.`;
    }
}
exports.AmbiguousError = AmbiguousError;
function singularize(type, namespace) {
    return (matches) => {
        if (namespace) {
            matches = matches.filter(m => m.namespace === namespace);
        }
        else if (matches.length > 1) {
            // In cases that aren't specific enough, filter by namespace
            matches = matches.filter(m => !Reflect.has(m, 'namespace') || m.namespace === null);
        }
        switch (matches.length) {
            case 0:
                throw new NotFound();
            case 1:
                return matches[0];
            default:
                throw new AmbiguousError(matches, type !== null && type !== void 0 ? type : '');
        }
    };
}
