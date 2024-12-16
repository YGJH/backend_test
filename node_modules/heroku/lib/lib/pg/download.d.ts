declare type downloadOptions = {
    progress: boolean;
};
export default function download(url: string, path: string, opts: downloadOptions): Promise<unknown>;
export {};
