'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.display = void 0;
const core_1 = require("@oclif/core");
const date_fns_1 = require("date-fns");
function display(auth) {
    const obj = {
        ID: auth.id,
        Description: auth.description,
        Scope: auth.scope ? auth.scope.join(',') : undefined,
        Client: '<none>',
    };
    if (auth.client) {
        obj.Client = auth.client.name;
        obj['Redirect URI'] = auth.client.redirect_uri;
    }
    if (auth.access_token) {
        obj.Token = auth.access_token.token;
        if (auth.updated_at) {
            obj['Updated at'] = `${(0, date_fns_1.addSeconds)(new Date(auth.updated_at), 0)} (${(0, date_fns_1.formatDistanceToNow)(new Date(auth.updated_at))} ago)`;
        }
        if (auth.access_token.expires_in) {
            const date = (0, date_fns_1.addSeconds)(new Date(), auth.access_token.expires_in);
            obj['Expires at'] = `${date} (in ${(0, date_fns_1.formatDistanceToNow)(date)})`;
        }
    }
    core_1.ux.styledObject(obj, [
        'Client',
        'Redirect URI',
        'ID',
        'Description',
        'Scope',
        'Token',
        'Expires at',
        'Updated at',
    ]);
}
exports.display = display;
