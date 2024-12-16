"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const color_1 = require("@heroku-cli/color");
const colorize_1 = require("./colorize");
const generation_1 = require("../apps/generation");
const EventSource = require('@heroku/eventsource');
function readLogs(logplexURL, isTail, recreateSessionTimeout) {
    return new Promise(function (resolve, reject) {
        const userAgent = process.env.HEROKU_DEBUG_USER_AGENT || 'heroku-run';
        const proxy = process.env.https_proxy || process.env.HTTPS_PROXY;
        const es = new EventSource(logplexURL, {
            proxy,
            headers: {
                'User-Agent': userAgent,
            },
        });
        es.addEventListener('error', function (err) {
            if (err && (err.status || err.message)) {
                const msg = (isTail && (err.status === 404 || err.status === 403)) ?
                    'Log stream timed out. Please try again.' :
                    `Logs eventsource failed with: ${err.status}${err.message ? ` ${err.message}` : ''}`;
                reject(new Error(msg));
                es.close();
            }
            if (!isTail) {
                resolve();
                es.close();
            }
            // should only land here if --tail and no error status or message
        });
        es.addEventListener('message', function (e) {
            e.data.trim().split(/\n+/).forEach(line => {
                core_1.ux.log((0, colorize_1.default)(line));
            });
        });
        if (isTail && recreateSessionTimeout) {
            setTimeout(() => {
                reject(new Error('Fir log stream timeout'));
                es.close();
            }, recreateSessionTimeout);
        }
    });
}
async function logDisplayer(heroku, options) {
    process.stdout.on('error', err => {
        if (err.code === 'EPIPE') {
            process.exit(0);
        }
        else {
            core_1.ux.error(err.stack, { exit: 1 });
        }
    });
    const firApp = await (0, generation_1.isFirApp)(options.app, heroku);
    const isTail = firApp || options.tail;
    const requestBodyParameters = {
        source: options.source,
    };
    if (firApp) {
        process.stderr.write(color_1.default.cyan.bold('Fetching logs...\n\n'));
        Object.assign(requestBodyParameters, {
            dyno: options.dyno,
            type: options.type,
        });
    }
    else {
        Object.assign(requestBodyParameters, {
            dyno: options.dyno || options.type,
            lines: options.lines,
            tail: options.tail,
        });
    }
    let recreateLogSession = false;
    do {
        const { body: logSession } = await heroku.post(`/apps/${options.app}/log-sessions`, {
            body: requestBodyParameters,
            headers: { Accept: 'application/vnd.heroku+json; version=3.sdk' },
        });
        try {
            await readLogs(logSession.logplex_url, isTail, firApp ? Number(process.env.HEROKU_LOG_STREAM_TIMEOUT || '15') * 60 * 1000 : undefined);
        }
        catch (error) {
            const { message } = error;
            if (message === 'Fir log stream timeout')
                recreateLogSession = true;
            else
                core_1.ux.error(message, { exit: 1 });
        }
    } while (recreateLogSession);
}
exports.default = logDisplayer;
