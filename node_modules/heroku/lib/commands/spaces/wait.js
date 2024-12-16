"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const spinner_1 = require("@oclif/core/lib/cli-ux/action/spinner");
const debug_1 = require("debug");
const spaces_1 = require("../../lib/spaces/spaces");
const notifications_1 = require("@heroku-cli/notifications");
const spacesDebug = (0, debug_1.default)('spaces:wait');
class Wait extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Wait);
        const spaceName = flags.space || args.space;
        if (!spaceName) {
            core_1.ux.error((0, tsheredoc_1.default)(`
        Error: Missing 1 required arg:
        space
        See more help with --help
      `));
        }
        const interval = flags.interval * 1000;
        const timeout = flags.timeout * 1000;
        const deadline = new Date(Date.now() + timeout);
        const action = new spinner_1.default();
        action.start(`Waiting for space ${color_1.default.green(spaceName)} to allocate`);
        const headers = {
            Accept: 'application/vnd.heroku+json; version=3.fir',
        };
        if (!flags.json) {
            headers['Accept-Expansion'] = 'region';
        }
        let { body: space } = await this.heroku.get(`/spaces/${spaceName}`, { headers });
        while (space.state === 'allocating') {
            if (new Date() > deadline) {
                throw new Error('Timeout waiting for space to become allocated.');
            }
            await this.wait(interval);
            const { body: updatedSpace } = await this.heroku.get(`/spaces/${spaceName}`, { headers });
            space = updatedSpace;
        }
        try {
            const { body: nat } = await this.heroku.get(`/spaces/${spaceName}/nat`, { headers: { Accept: 'application/vnd.heroku+json; version=3.fir' } });
            space.outbound_ips = nat;
        }
        catch (error) {
            spacesDebug(`Retrieving NAT details for the space failed with ${error}`);
        }
        action.stop();
        (0, spaces_1.renderInfo)(space, flags.json);
        this.notify(spaceName);
    }
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    notify(spaceName) {
        try {
            const notification = {
                title: spaceName,
                subtitle: `heroku spaces:wait ${spaceName}`,
                message: 'space was successfully created',
                sound: true,
            };
            (0, notifications_1.notify)(notification);
        }
        catch (error) {
            core_1.ux.warn(error);
        }
    }
}
exports.default = Wait;
Wait.topic = 'spaces';
Wait.description = 'wait for a space to be created';
Wait.flags = {
    space: command_1.flags.string({ char: 's', description: 'space to get info of' }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
    interval: command_1.flags.integer({
        char: 'i',
        description: 'seconds to wait between poll intervals',
        default: 30,
    }),
    timeout: command_1.flags.integer({
        char: 't',
        description: 'maximum number of seconds to wait',
        default: 25 * 60,
    }),
};
Wait.args = {
    space: core_1.Args.string({ hidden: true }),
};
