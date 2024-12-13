"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
function formatKey(key) {
    const [name, pub, email] = key.trim().split(/\s/);
    return `${name} ${pub.slice(0, 10)}...${pub.slice(-10)} ${color_1.default.green(email)}`;
}
class Keys extends command_1.Command {
    async run() {
        const { flags } = await this.parse(Keys);
        const { body: keys } = await this.heroku.get('/account/keys');
        if (flags.json) {
            core_1.ux.styledJSON(keys);
        }
        else if (keys.length === 0) {
            core_1.ux.warn('You have no SSH keys.');
        }
        else {
            core_1.ux.styledHeader(`${color_1.default.cyan(keys[0].email || '')} keys`);
            if (flags.long) {
                keys.forEach(k => core_1.ux.log(k.public_key));
            }
            else {
                keys.map(k => core_1.ux.log(formatKey(k.public_key || '')));
            }
        }
    }
}
exports.default = Keys;
Keys.description = 'display your SSH keys';
Keys.flags = {
    json: command_1.flags.boolean({ description: 'output in json format' }),
    long: command_1.flags.boolean({ char: 'l', description: 'display full SSH keys' }),
};
