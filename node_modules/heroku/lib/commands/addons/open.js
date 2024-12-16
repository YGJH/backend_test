"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const resolve_1 = require("../../lib/addons/resolve");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const http_call_1 = require("http-call");
const open = require("open");
class Open extends command_1.Command {
    constructor() {
        super(...arguments);
        this.parsed = this.parse(Open);
    }
    static async openUrl(url) {
        core_1.ux.log(`Opening ${color_1.default.cyan(url)}...`);
        await Open.urlOpener(url);
    }
    async run() {
        const ctx = await this.parsed;
        const { flags: { app }, args: { addon } } = ctx;
        if (process.env.HEROKU_SUDO) {
            return this.sudo(ctx);
        }
        let attachment = null;
        try {
            attachment = await (0, resolve_1.attachmentResolver)(this.heroku, app, addon);
        }
        catch (error) {
            if (error instanceof http_call_1.HTTPError && error.statusCode !== 404) {
                throw error;
            }
        }
        let webUrl;
        if (attachment) {
            webUrl = attachment.web_url;
        }
        else {
            const resolvedAddon = await (0, resolve_1.resolveAddon)(this.heroku, app, addon);
            webUrl = resolvedAddon.web_url;
        }
        if (ctx.flags['show-url']) {
            core_1.ux.log(webUrl);
        }
        else {
            await Open.openUrl(webUrl);
        }
    }
    async sudo(ctx) {
        const { flags: { app }, args } = ctx;
        const sso = await this.heroku.request(`/apps/${app}/addons/${args.addon}/sso`, {
            method: 'GET',
            headers: {
                Accept: 'application/vnd.heroku+json; version=3.add-ons-sso',
            },
        });
        const { method, action } = sso.body;
        if (method === 'get') {
            await Open.openUrl(action);
        }
        else {
            const ssoPath = await this.writeSudoTemplate(ctx, sso.body);
            await Open.openUrl(`file://${ssoPath}`);
        }
    }
    async writeSudoTemplate(ctx, sso) {
        const ssoPath = path.join(os.tmpdir(), 'heroku-sso.html');
        const { flags: { app }, args } = ctx;
        const html = `<!DOCTYPE HTML>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <title>Heroku Add-ons SSO</title>\n    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>\n  </head>\n\n  <body>\n    <h3>Opening ${args.addon}${app ? ` on ${app}` : ''}...</h3>\n    <form method="POST" action="${sso.action}">\n    </form>\n\n    <script>\n      var params = ${JSON.stringify(sso.params)}\n      var form = document.forms[0]\n      $(document).ready(function() {\n        $.each(params, function(key, value) {\n          $('<input>').attr({ type: 'hidden', name: key, value: value })\n            .appendTo(form)\n        })\n        form.submit()\n      })\n    </script>\n  </body>\n</html>`;
        await fs.writeFile(ssoPath, html);
        return ssoPath;
    }
}
exports.default = Open;
Open.urlOpener = open;
Open.topic = 'addons';
Open.description = 'open an add-on\'s dashboard in your browser';
Open.flags = {
    'show-url': command_1.flags.boolean({ description: 'show URL, do not open browser' }),
    app: command_1.flags.app(),
    remote: command_1.flags.remote(),
};
Open.args = {
    addon: core_1.Args.string({ required: true, description: 'unique identifier or globally unique name of the add-on' }),
};
