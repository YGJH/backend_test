"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayTelemetryDrain = exports.validateAndFormatSignals = void 0;
const core_1 = require("@oclif/core");
function validateAndFormatSignals(signalInput) {
    const signalOptions = ['traces', 'metrics', 'logs'];
    if (!signalInput || signalInput === 'all')
        return signalOptions;
    const signalArray = signalInput.split(',');
    signalArray.forEach(signal => {
        if (!signalOptions.includes(signal)) {
            core_1.ux.error(`Invalid signal option: ${signalArray}. Run heroku telemetry:add --help to see signal options.`, { exit: 1 });
        }
    });
    return signalArray;
}
exports.validateAndFormatSignals = validateAndFormatSignals;
function displayTelemetryDrain(telemetryDrain) {
    core_1.ux.styledHeader(telemetryDrain.id);
    const drainType = telemetryDrain.owner.type.charAt(0).toUpperCase() + telemetryDrain.owner.type.slice(1);
    core_1.ux.styledObject({
        [drainType]: telemetryDrain.owner.name,
        Signals: telemetryDrain.signals.join(', '),
        Endpoint: telemetryDrain.exporter.endpoint,
        Kind: telemetryDrain.exporter.type,
        Headers: telemetryDrain.exporter.headers,
    }, ['App', 'Space', 'Signals', 'Endpoint', 'Kind', 'Headers']);
}
exports.displayTelemetryDrain = displayTelemetryDrain;
