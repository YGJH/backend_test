export declare const processor: any;
interface Telemetry {
    command: string;
    os: string;
    version: string;
    exitCode: number;
    exitState: string;
    cliRunDuration: number;
    commandRunDuration: number;
    lifecycleHookCompletion: {
        init: boolean;
        prerun: boolean;
        postrun: boolean;
        command_not_found: boolean;
    };
    isVersionOrHelp: boolean;
}
export interface TelemetryGlobal extends NodeJS.Global {
    cliTelemetry?: Telemetry;
}
interface CLIError extends Error {
    cliRunDuration?: string;
}
export declare function initializeInstrumentation(): void;
export declare function setupTelemetry(config: any, opts: any): {
    command: any;
    os: any;
    version: any;
    exitCode: number;
    exitState: string;
    cliRunDuration: number;
    commandRunDuration: number;
    lifecycleHookCompletion: {
        init: boolean;
        prerun: boolean;
        postrun: boolean;
        command_not_found: boolean;
    };
    isVersionOrHelp: boolean;
};
export declare function computeDuration(cmdStartTime: any): number;
export declare function reportCmdNotFound(config: any): {
    command: string;
    os: any;
    version: any;
    exitCode: number;
    exitState: string;
    cliRunDuration: number;
    commandRunDuration: number;
    lifecycleHookCompletion: {
        init: boolean;
        prerun: boolean;
        postrun: boolean;
        command_not_found: boolean;
    };
    isVersionOrHelp: boolean;
};
export declare function sendTelemetry(currentTelemetry: any, rollbarCb?: () => void): Promise<void>;
export declare function sendToHoneycomb(data: Telemetry | CLIError): Promise<void>;
export declare function sendToRollbar(data: CLIError, rollbarCb?: () => void): Promise<unknown>;
export {};
