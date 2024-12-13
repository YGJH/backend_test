"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const spaces_1 = require("../../lib/spaces/spaces");
const debug_1 = require("debug");
const spacesDebug = (0, debug_1.default)('spaces:info');
class Info extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Info);
        const spaceName = flags.space || args.space;
        if (!spaceName) {
            core_1.ux.error((0, tsheredoc_1.default)(`
        Error: Missing 1 required arg:
        space
        See more help with --help
      `));
        }
        const headers = {
            Accept: 'application/vnd.heroku+json; version=3.fir',
        };
        if (!flags.json) {
            headers['Accept-Expansion'] = 'region';
        }
        const { body: space } = await this.heroku.get(`/spaces/${spaceName}`, { headers });
        if (space.state === 'allocated') {
            try {
                const { body: outbound_ips } = await this.heroku.get(`/spaces/${spaceName}/nat`, { headers: { Accept: 'application/vnd.heroku+json; version=3.fir' } });
                space.outbound_ips = outbound_ips;
            }
            catch (error) {
                spacesDebug(`Retrieving NAT details for the space failed with ${error}`);
            }
        }
        (0, spaces_1.renderInfo)(space, flags.json);
    }
}
exports.default = Info;
Info.topic = 'spaces';
Info.description = 'show info about a space';
Info.example = '$ heroku spaces:info my-space';
Info.flags = {
    space: command_1.flags.string({ char: 's', description: 'space to get info of' }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
};
Info.args = {
    space: core_1.Args.string({ hidden: true }),
};
