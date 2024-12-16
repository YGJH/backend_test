export declare type cmdOptions = {
    output?: boolean;
    input?: string;
};
export declare const cmd: (cmd: string, args: string[], options?: cmdOptions) => Promise<string>;
export declare const version: () => Promise<number[]>;
export declare const pullImage: (resource: string) => Promise<string>;
export declare const getDockerfiles: (rootdir: string, recursive: boolean) => string[];
export declare type dockerJob = {
    name: string;
    resource: string;
    dockerfile: string;
    postfix: number;
    depth: number;
};
export declare type groupedDockerJobs = {
    [processType: string]: dockerJob[];
};
export declare const getJobs: (resourceRoot: string, dockerfiles: string[]) => groupedDockerJobs;
export declare const filterByProcessType: (jobs: groupedDockerJobs, processTypes: string[]) => groupedDockerJobs;
export declare const chooseJobs: (jobs: groupedDockerJobs) => Promise<dockerJob[]>;
declare type BuildImageParams = {
    dockerfile: string;
    resource: string;
    buildArgs: string[];
    path?: string;
    arch?: string;
};
export declare const buildImage: ({ dockerfile, resource, buildArgs, path, arch }: BuildImageParams) => Promise<string>;
export declare const pushImage: (resource: string) => Promise<string>;
export declare const runImage: (resource: string, command: string, port: number) => Promise<string>;
export {};
