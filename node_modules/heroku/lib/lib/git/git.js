"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const cp = require("child_process");
const core_1 = require("@oclif/core");
const fs = require("fs");
const util_1 = require("util");
const execFile = (0, util_1.promisify)(cp.execFile);
const debug = require('debug')('git');
class Git {
    async exec(args) {
        debug('exec: git %o', args);
        try {
            const { stdout, stderr } = await execFile('git', args);
            if (stderr)
                process.stderr.write(stderr);
            return stdout.trim();
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                core_1.ux.error('Git must be installed to use the Heroku CLI.  See instructions here: https://git-scm.com');
            }
            throw error;
        }
    }
    spawn(args) {
        return new Promise((resolve, reject) => {
            debug('spawn: git %o', args);
            const s = cp.spawn('git', args, { stdio: [0, 1, 2] });
            s.on('error', (err) => {
                if (err.code === 'ENOENT') {
                    core_1.ux.error('Git must be installed to use the Heroku CLI.  See instructions here: https://git-scm.com');
                }
                else
                    reject(err);
            });
            s.on('close', resolve);
        });
    }
    remoteFromGitConfig() {
        return this.exec(['config', 'heroku.remote']).catch(() => { });
    }
    httpGitUrl(app) {
        return `https://${command_1.vars.httpGitHost}/${app}.git`;
    }
    async remoteUrl(name) {
        var _a, _b, _c;
        const remotes = await this.exec(['remote', '-v']);
        return (_c = (_b = (_a = remotes.split('\n')
            .map(r => r.split('\t'))
            .find(r => r[0] === name)) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.split(' ')[0]) !== null && _c !== void 0 ? _c : '';
    }
    url(app) {
        return this.httpGitUrl(app);
    }
    async getBranch(symbolicRef) {
        return this.exec(['symbolic-ref', '--short', symbolicRef]);
    }
    async getRef(branch) {
        return this.exec(['rev-parse', branch || 'HEAD']);
    }
    async getCommitTitle(ref) {
        return this.exec(['log', ref || '', '-1', '--pretty=format:%s']);
    }
    async readCommit(commit) {
        const branch = await this.getBranch('HEAD');
        const ref = await this.getRef(commit);
        const message = await this.getCommitTitle(ref);
        return Promise.resolve({
            branch: branch,
            ref: ref,
            message: message,
        });
    }
    inGitRepo() {
        try {
            fs.lstatSync('.git');
            return true;
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                throw error;
        }
    }
    hasGitRemote(remote) {
        return this.remoteUrl(remote)
            .then((remote) => Boolean(remote));
    }
    createRemote(remote, url) {
        return this.hasGitRemote(remote)
            .then(exists => !exists ? this.exec(['remote', 'add', remote, url]) : null);
    }
}
exports.default = Git;
