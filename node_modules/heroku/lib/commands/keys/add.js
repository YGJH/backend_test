"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const inquirer = require("inquirer");
const path = require("path");
const os = require("os");
const fs = require("fs-extra");
function sshKeygen(file, quiet) {
    const spawn = require('child_process').spawn;
    return new Promise(function (resolve, reject) {
        spawn('ssh-keygen', ['-o', '-t', 'rsa', '-N', '', '-f', file], { stdio: quiet ? null : 'inherit' })
            .on('close', (code) => code === 0 ? resolve(null) : reject(code));
    });
}
async function confirmPrompt(message) {
    if (process.stdin.isTTY) {
        return inquirer.prompt([{
                type: 'confirm',
                name: 'yes',
                message: message,
            }]);
    }
    const data = await core_1.ux.prompt(message + ' [Y/n]');
    return { yes: /^y(es)?/i.test(data) };
}
class Add extends command_1.Command {
    async run() {
        const { flags, args } = await this.parse(Add);
        const sshdir = path.join(os.homedir(), '.ssh');
        const generate = async function () {
            await fs.ensureDir(sshdir, { mode: 0o700 });
            await sshKeygen(path.join(sshdir, 'id_rsa'), flags.quiet);
        };
        const findKey = async function () {
            const defaultKey = path.join(sshdir, 'id_rsa.pub');
            if (!(await fs.pathExists(defaultKey))) {
                core_1.ux.warn('Could not find an existing SSH key at ' + path.join('~', '.ssh', 'id_rsa.pub'));
                if (!flags.yes) {
                    const resp = await confirmPrompt('Would you like to generate a new one?');
                    if (!resp.yes)
                        return;
                }
                await generate();
                return defaultKey;
            }
            let keys = await fs.readdir(sshdir);
            keys = keys.map(k => path.join(sshdir, k));
            keys = keys.filter(k => path.extname(k) === '.pub');
            if (keys.length === 1) {
                const key = keys[0];
                core_1.ux.warn(`Found an SSH public key at ${color_1.default.cyan(key)}`);
                if (!flags.yes) {
                    const resp = await confirmPrompt('Would you like to upload it to Heroku?');
                    if (!resp.yes)
                        return;
                }
                return key;
            }
            const resp = await inquirer.prompt([{
                    type: 'list',
                    name: 'key',
                    choices: keys,
                    message: 'Which SSH key would you like to upload?',
                }]);
            return resp.key;
        };
        let key = args.key;
        if (!key)
            key = await findKey();
        if (!key)
            throw new Error('No key to upload');
        core_1.ux.action.start(`Uploading ${color_1.default.cyan(key)} SSH key`);
        const publicKey = await fs.readFile(key, { encoding: 'utf8' });
        await this.heroku.post('/account/keys', {
            body: {
                public_key: publicKey,
            },
        });
        core_1.ux.action.stop();
    }
}
exports.default = Add;
Add.description = 'add an SSH key for a user';
Add.help = 'if no KEY is specified, will try to find ~/.ssh/id_rsa.pub';
Add.example = `$ heroku keys:add
Could not find an existing public key.
Would you like to generate one? [Yn] y
Generating new SSH public key.
Uploading SSH public key /.ssh/id_rsa.pub... done

$ heroku keys:add /my/key.pub
Uploading SSH public key /my/key.pub... done`;
Add.flags = {
    quiet: command_1.flags.boolean({ hidden: true }),
    yes: command_1.flags.boolean({ char: 'y', description: 'automatically answer yes for all prompts' }),
};
Add.args = {
    key: core_1.Args.string({ description: 'absolute path to the key located on disk. If omitted, we use the default rsa key.' }),
};
