"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitCredentials = void 0;
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
class GitCredentials extends command_1.Command {
    async run() {
        const { args } = await this.parse(GitCredentials);
        switch (args.command) {
            case 'get':
                if (!this.heroku.auth)
                    throw new Error('not logged in');
                this.log(`protocol=https
host=git.heroku.com
username=heroku
password=${this.heroku.auth}`);
                break;
            case 'erase':
            case 'store':
                // ignore
                break;
            default:
                throw new Error(`unknown command: ${args.command}`);
        }
    }
}
exports.GitCredentials = GitCredentials;
GitCredentials.hidden = true;
GitCredentials.description = 'internal command for git-credentials';
GitCredentials.args = {
    command: core_1.Args.string({ required: true, description: 'command name of the git credentials' }),
};
