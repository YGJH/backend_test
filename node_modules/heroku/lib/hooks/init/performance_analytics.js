"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telemetry = require("../../global_telemetry");
const performance_analytics = async function (options) {
    global.cliTelemetry = telemetry.setupTelemetry(this.config, options);
};
exports.default = performance_analytics;
