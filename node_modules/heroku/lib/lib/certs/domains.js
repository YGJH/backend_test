"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForDomains = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
function customDomainCreationComplete(app, heroku) {
    return tslib_1.__asyncGenerator(this, arguments, function* customDomainCreationComplete_1() {
        let retries = 30;
        while (retries--) {
            const { body: apiDomains } = yield tslib_1.__await(heroku.get(`/apps/${app}/domains`));
            const someNull = apiDomains.some((domain) => domain.kind === 'custom' && !domain.cname);
            if (!someNull) {
                yield yield tslib_1.__await(apiDomains);
                break;
            }
            yield tslib_1.__await(new Promise(resolve => {
                setTimeout(resolve, 1000);
            }));
            yield yield tslib_1.__await(null);
        }
    });
}
async function waitForDomains(app, heroku) {
    var e_1, _a;
    core_1.ux.action.start('Waiting for stable domains to be created');
    try {
        for (var _b = tslib_1.__asyncValues(customDomainCreationComplete(app, heroku)), _c; _c = await _b.next(), !_c.done;) {
            const apiDomains = _c.value;
            if (apiDomains) {
                core_1.ux.action.stop();
                return apiDomains;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    core_1.ux.action.stop('!');
    throw new Error('Timed out while waiting for stable domains to be created');
}
exports.waitForDomains = waitForDomains;
