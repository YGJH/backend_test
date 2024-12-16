"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runImage = exports.pushImage = exports.buildImage = exports.chooseJobs = exports.filterByProcessType = exports.getJobs = exports.getDockerfiles = exports.pullImage = exports.version = exports.cmd = void 0;
const Child = require("child_process");
const debug_1 = require("./debug");
const glob = require("glob");
const Path = require("path");
const inquirer = require("inquirer");
const os = require("os");
const core_1 = require("@oclif/core");
const DOCKERFILE_REGEX = /\bDockerfile(.\w*)?$/;
const cmd = async function (cmd, args, options = {}) {
    (0, debug_1.debug)(cmd, args);
    const stdio = [
        options.input ? 'pipe' : process.stdin,
        options.output ? 'pipe' : process.stdout,
        process.stderr,
    ];
    return new Promise((resolve, reject) => {
        const child = Child.spawn(cmd, args, { stdio: stdio });
        if (child.stdin) {
            child.stdin.end(options.input);
        }
        let stdout;
        if (child.stdout) {
            stdout = '';
            child.stdout.on('data', data => {
                stdout += data.toString();
            });
        }
        child.on('error', (err) => {
            if (err.code === 'ENOENT' && err.path === 'docker') {
                reject(new Error(`Cannot find docker, please ensure docker is installed.
        If you need help installing docker, visit https://docs.docker.com/install/#supported-platforms`));
            }
            else {
                reject(err);
            }
        });
        child.on('exit', (code, signal) => {
            if (signal || code) {
                reject(new Error(signal || (code === null || code === void 0 ? void 0 : code.toString())));
            }
            else {
                resolve(stdout);
            }
        });
    });
};
exports.cmd = cmd;
const version = async function () {
    const version = await (0, exports.cmd)('docker', ['version', '-f', '{{.Client.Version}}'], { output: true });
    const [major, minor] = version.split(/\./);
    return [Number.parseInt(major, 10) || 0, Number.parseInt(minor, 10) || 0]; // ensure exactly 2 components
};
exports.version = version;
const pullImage = function (resource) {
    const args = ['pull', resource];
    return (0, exports.cmd)('docker', args);
};
exports.pullImage = pullImage;
const getDockerfiles = function (rootdir, recursive) {
    const match = recursive ? './**/Dockerfile?(.)*' : 'Dockerfile*';
    let dockerfiles = glob.sync(match, {
        cwd: rootdir,
        nodir: true,
    });
    if (recursive) {
        dockerfiles = dockerfiles.filter(df => df.match(/Dockerfile\.[\w]+$/));
    }
    else {
        dockerfiles = dockerfiles.filter(df => df.match(/Dockerfile$/));
    }
    return dockerfiles.map(file => Path.join(rootdir, file));
};
exports.getDockerfiles = getDockerfiles;
const getJobs = function (resourceRoot, dockerfiles) {
    const jobs = [];
    dockerfiles.forEach(dockerfile => {
        const match = dockerfile.match(DOCKERFILE_REGEX);
        if (match) {
            const proc = (match[1] || '.standard').slice(1);
            jobs.push({
                name: proc,
                resource: `${resourceRoot}/${proc}`,
                dockerfile: dockerfile,
                postfix: Path.basename(dockerfile) === 'Dockerfile' ? 0 : 1,
                depth: Path.normalize(dockerfile).split(Path.sep).length,
            });
        }
    });
    // prefer closer Dockerfiles, then prefer Dockerfile over Dockerfile.web
    jobs.sort((a, b) => {
        return a.depth - b.depth || a.postfix - b.postfix;
    });
    // group all Dockerfiles for the same process type together
    const groupedJobs = {};
    jobs.forEach(job => {
        groupedJobs[job.name] = groupedJobs[job.name] || [];
        groupedJobs[job.name].push(job);
    });
    return groupedJobs;
};
exports.getJobs = getJobs;
const filterByProcessType = function (jobs, processTypes) {
    const filteredJobs = {};
    processTypes.forEach(processType => {
        filteredJobs[processType] = jobs[processType];
    });
    return filteredJobs;
};
exports.filterByProcessType = filterByProcessType;
const chooseJobs = async function (jobs) {
    const chosenJobs = [];
    for (const processType in jobs) {
        if (Object.prototype.hasOwnProperty.call(jobs, processType)) {
            const group = jobs[processType];
            if (group === undefined) {
                core_1.ux.warn(`Dockerfile.${processType} not found`);
                continue;
            }
            if (group.length > 1) {
                const prompt = [{
                        type: 'list',
                        name: processType,
                        choices: group.map(j => j.dockerfile),
                        message: `Found multiple Dockerfiles with process type ${processType}. Please choose one to build and push `,
                    }];
                const answer = await inquirer.prompt(prompt);
                const found = group.find(o => o.dockerfile === answer[processType]);
                if (found) {
                    chosenJobs.push(found);
                }
            }
            else {
                chosenJobs.push(group[0]);
            }
        }
    }
    return chosenJobs;
};
exports.chooseJobs = chooseJobs;
const buildImage = async function ({ dockerfile, resource, buildArgs, path, arch }) {
    const cwd = path || Path.dirname(dockerfile);
    const args = ['build', '-f', dockerfile, '-t', resource];
    // Older Docker versions don't allow for this flag, but we are
    // adding it here when necessary to allow for pushing a docker build from m1/m2 Macs.
    if (arch === 'arm64')
        args.push('--platform', 'linux/amd64');
    for (const element of buildArgs) {
        if (element.length > 0) {
            args.push('--build-arg', element);
        }
    }
    args.push(cwd);
    return (0, exports.cmd)('docker', args);
};
exports.buildImage = buildImage;
const pushImage = async function (resource) {
    const args = ['push', resource];
    return (0, exports.cmd)('docker', args);
};
exports.pushImage = pushImage;
const runImage = function (resource, command, port) {
    const args = [
        'run',
        '--user',
        os.userInfo().uid.toString(),
        '-e',
        `PORT=${port}`,
        '-it',
        resource,
        command,
    ];
    return (0, exports.cmd)('docker', args);
};
exports.runImage = runImage;
