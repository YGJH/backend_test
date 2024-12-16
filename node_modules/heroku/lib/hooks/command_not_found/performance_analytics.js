"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telemetry = require("../../global_telemetry");
const performance_analytics = async function () {
    global.cliTelemetry = telemetry.reportCmdNotFound(this.config);
};
exports.default = performance_analytics;
