declare function createArchive(ref: string): Promise<any>;
declare function githubRepository(): Promise<any>;
declare function readCommit(commit: string): Promise<{
    branch: string | undefined;
    ref: string | undefined;
    message: string | undefined;
}>;
declare function sshGitUrl(app: string): string;
declare function gitUrl(app?: string): string;
declare function listRemotes(): Promise<string[][]>;
declare function inGitRepo(): true | undefined;
declare function rmRemote(remote: string): Promise<string>;
declare function createRemote(remote: string, url: string): Promise<string | null>;
export { createArchive, githubRepository, readCommit, sshGitUrl, gitUrl, createRemote, listRemotes, rmRemote, inGitRepo, };
