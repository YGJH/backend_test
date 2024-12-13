/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { SpawnOptions, type SpawnOptionsWithStdioTuple } from 'child_process';
import type { ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import type { Server } from 'node:net';
import { Stream } from 'node:stream';
import { getConfigs, TunnelConfig } from './bastion';
import { ConnectionDetails, getConnectionDetails } from './util';
export declare function psqlQueryOptions(query: string, dbEnv: NodeJS.ProcessEnv, cmdArgs?: string[]): {
    dbEnv: NodeJS.ProcessEnv;
    psqlArgs: string[];
    childProcessOptions: SpawnOptionsWithStdioTuple<"ignore", "pipe", "inherit">;
};
export declare function psqlFileOptions(file: string, dbEnv: NodeJS.ProcessEnv): {
    dbEnv: NodeJS.ProcessEnv;
    psqlArgs: string[];
    childProcessOptions: SpawnOptions;
};
export declare function psqlInteractiveOptions(prompt: string, dbEnv: NodeJS.ProcessEnv): {
    dbEnv: NodeJS.ProcessEnv;
    psqlArgs: string[];
    childProcessOptions: SpawnOptions;
};
export declare function execPSQL({ dbEnv, psqlArgs, childProcessOptions }: {
    dbEnv: NodeJS.ProcessEnv;
    psqlArgs: string[];
    childProcessOptions: SpawnOptions;
}): ChildProcess;
export declare function waitForPSQLExit(psql: EventEmitter): Promise<void>;
export declare const trapAndForwardSignalsToChildProcess: (childProcess: ChildProcess) => () => void;
export declare function consumeStream(inputStream: Stream): Promise<unknown>;
export declare function runWithTunnel(db: ConnectionDetails, tunnelConfig: TunnelConfig, options: Parameters<typeof execPSQL>[0]): Promise<string>;
export declare class Tunnel {
    private readonly bastionTunnel;
    private readonly events;
    constructor(bastionTunnel: Server);
    waitForClose(): Promise<void>;
    close(): void;
    static connect(db: ConnectionDetails, tunnelConfig: TunnelConfig): Promise<Tunnel>;
}
export declare function fetchVersion(db: Parameters<typeof exec>[0]): Promise<string | undefined>;
export declare function exec(db: ConnectionDetails, query: string, cmdArgs?: string[]): Promise<string>;
export declare function execFile(db: Parameters<typeof getConfigs>[0], file: string): Promise<string>;
export declare function interactive(db: ReturnType<typeof getConnectionDetails>): Promise<string>;
