/// <reference types="node" />
/// <reference types="node" />
import { APIClient } from '@heroku-cli/command';
import * as createTunnel from 'tunnel-ssh';
import { ConnectionDetails } from './util';
export declare const getBastion: (config: Record<string, string>, baseName: string) => {
    bastionHost: string;
    bastionKey: string;
} | {
    bastionHost?: undefined;
    bastionKey?: undefined;
};
export declare const env: (db: ConnectionDetails) => {
    PGAPPNAME: string;
    PGSSLMODE: string;
} & NodeJS.ProcessEnv;
export declare type TunnelConfig = createTunnel.Config;
export declare function tunnelConfig(db: ConnectionDetails): TunnelConfig;
export declare function getConfigs(db: ConnectionDetails): {
    dbEnv: NodeJS.ProcessEnv;
    dbTunnelConfig: createTunnel.Config;
};
export declare function sshTunnel(db: ConnectionDetails, dbTunnelConfig: TunnelConfig, timeout?: number): Promise<void | import("net").Server | null>;
export declare function fetchConfig(heroku: APIClient, db: {
    id: string;
}): Promise<import("http-call").HTTP<{
    host: string;
    private_key: string;
}>>;
