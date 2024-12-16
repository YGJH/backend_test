"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToConfig = void 0;
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const _ = require("lodash");
const quote_1 = require("../../lib/config/quote");
const util_1 = require("../../lib/config/util");
const editor = new util_1.Editor();
function configToString(config) {
    return Object.keys(config)
        .sort()
        .map(key => {
        return `${key}=${(0, quote_1.quote)(config[key])}`;
    })
        .join('\n');
}
function removeDeleted(newConfig, original) {
    for (const k of Object.keys(original)) {
        // The api accepts empty strings
        // as valid env var values
        // In JS an empty string is false
        if (!newConfig[k] && newConfig[k] !== '')
            newConfig[k] = null;
    }
}
function stringToConfig(s) {
    return s.split('\n').reduce((config, line) => {
        const error = () => {
            throw new Error(`Invalid line: ${line}`);
        };
        if (!line)
            return config;
        const i = line.indexOf('=');
        if (i === -1)
            error();
        config[line.slice(0, i)] = (0, quote_1.parse)(line.slice(i + 1)) || '';
        return config;
    }, {});
}
exports.stringToConfig = stringToConfig;
function allKeys(a, b) {
    return _.uniq([...Object.keys(a), ...Object.keys(b)].sort());
}
function showDiff(from, to) {
    for (const k of allKeys(from, to)) {
        if (from[k] === to[k])
            continue;
        if (k in from) {
            core_1.ux.log(color_1.color.red(`- ${k}=${(0, quote_1.quote)(from[k])}`));
        }
        if (k in to) {
            core_1.ux.log(color_1.color.green(`+ ${k}=${(0, quote_1.quote)(to[k])}`));
        }
    }
}
class ConfigEdit extends command_1.Command {
    async run() {
        const { flags: { app }, args: { key } } = await this.parse(ConfigEdit);
        this.app = app;
        core_1.ux.action.start('Fetching config');
        const original = await this.fetchLatestConfig();
        core_1.ux.action.stop();
        let newConfig = Object.assign({}, original);
        const prefix = `heroku-${app}-config-`;
        if (key) {
            newConfig[key] = await editor.edit(original[key], { prefix });
            if (!original[key].endsWith('\n') && newConfig[key].endsWith('\n'))
                newConfig[key] = newConfig[key].slice(0, -1);
        }
        else {
            const s = await editor.edit(configToString(original), { prefix, postfix: '.sh' });
            newConfig = stringToConfig(s);
        }
        if (!await this.diffPrompt(original, newConfig))
            return;
        core_1.ux.action.start('Verifying new config');
        await this.verifyUnchanged(original);
        core_1.ux.action.start('Updating config');
        removeDeleted(newConfig, original);
        await this.updateConfig(newConfig);
        core_1.ux.action.stop();
    }
    async fetchLatestConfig() {
        const { body: original } = await this.heroku.get(`/apps/${this.app}/config-vars`);
        return original;
    }
    async diffPrompt(original, newConfig) {
        if (_.isEqual(original, newConfig)) {
            this.warn('no changes to config');
            return false;
        }
        core_1.ux.log();
        core_1.ux.log('Config Diff:');
        showDiff(original, newConfig);
        core_1.ux.log();
        return core_1.ux.confirm(`Update config on ${color_1.color.app(this.app)} with these values?`);
    }
    async verifyUnchanged(original) {
        const latest = await this.fetchLatestConfig();
        if (!_.isEqual(original, latest)) {
            throw new Error('Config changed on server. Refusing to update.');
        }
    }
    async updateConfig(newConfig) {
        await this.heroku.patch(`/apps/${this.app}/config-vars`, {
            body: newConfig,
        });
    }
}
exports.default = ConfigEdit;
ConfigEdit.description = `interactively edit config vars
This command opens the app config in a text editor set by $VISUAL or $EDITOR.
Any variables added/removed/changed will be updated on the app after saving and closing the file.`;
ConfigEdit.examples = [
    `# edit with vim
$ EDITOR="vim" heroku config:edit`,
    `# edit with emacs
$ EDITOR="emacs" heroku config:edit`,
    `# edit with pico
$ EDITOR="pico" heroku config:edit`,
    `# edit with atom editor
$ VISUAL="atom --wait" heroku config:edit`,
];
ConfigEdit.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
ConfigEdit.args = {
    key: core_1.Args.string({ optional: true, description: 'edit a single key' }),
};
