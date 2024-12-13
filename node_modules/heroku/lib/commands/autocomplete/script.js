"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const path = require("path");
const base_1 = require("../../lib/autocomplete/base");
class Script extends base_1.AutocompleteBase {
    async run() {
        const { args } = await this.parse(Script);
        const shell = args.shell || this.config.shell;
        this.errorIfNotSupportedShell(shell);
        const shellUpcase = shell.toUpperCase();
        this.log(`${this.prefix}HEROKU_AC_${shellUpcase}_SETUP_PATH=${path.join(this.autocompleteCacheDir, `${shell}_setup`)} && test -f $HEROKU_AC_${shellUpcase}_SETUP_PATH && source $HEROKU_AC_${shellUpcase}_SETUP_PATH;`);
    }
    get prefix() {
        return `\n# ${this.config.bin} autocomplete setup\n`;
    }
}
exports.default = Script;
Script.description = 'display autocomplete setup script for shell';
Script.hidden = true;
Script.args = {
    shell: core_1.Args.string({ description: 'shell type', required: false }),
};
