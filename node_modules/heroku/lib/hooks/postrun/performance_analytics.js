"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telemetry = require("../../global_telemetry");
const performance_analytics = async function () {
    if (process.env.IS_HEROKU_TEST_ENV === 'true' || !global.cliTelemetry) {
        return;
    }
    const cmdStartTime = global.cliTelemetry.commandRunDuration;
    global.cliTelemetry.commandRunDuration = telemetry.computeDuration(cmdStartTime);
    global.cliTelemetry.lifecycleHookCompletion.postrun = true;
};
exports.default = performance_analytics;
