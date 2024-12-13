export default class Git {
    exec(args: string[]): Promise<string>;
    spawn(args: string[]): Promise<unknown>;
    remoteFromGitConfig(): Promise<string | void>;
    httpGitUrl(app: string): string;
    remoteUrl(name: string): Promise<string>;
    url(app: string): string;
    getBranch(symbolicRef: string): Promise<string>;
    getRef(branch: string): Promise<string>;
    getCommitTitle(ref: string): Promise<string>;
    readCommit(commit: string): Promise<{
        branch: string;
        ref: string;
        message: string;
    }>;
    inGitRepo(): true | undefined;
    hasGitRemote(remote: string): Promise<boolean>;
    createRemote(remote: string, url: string): Promise<string | null>;
}
