#!/usr/bin/env decaf

var process = require('process'),
    File = require('File');

var upstartTemplate = [
    'description "DecafJS Server"',
    'author      "Mike Schwartz - http://moduscreate.com"',
    '',
    '# Assure all mounts are ready when booting',
    'start on started mountall',
    'stop on shutdown',
    '',
    '# Automatically Respawn:',
    'respawn',
    'respawn limit 99 5',
    '',
    'script',
    '   # Not sure why $HOME is needed...',
    '   export HOME="/root"',
    '',
    '   cd {serverdir}',
    '   exec /usr/local/bin/decaf {bootstrap} >> /var/log/decaf-stdout.log 2>&1',
    'end script',
    '',
    'post-start script',
    '   # Optionally put a script here that will notifiy you that DecafJS has (re)started',
    'end script'
].join('\n');

function gets(prompt) {
    java.lang.System.out.print(prompt);
    var ret = console.readLine();
    // var ret = builtin.editline.gets(prompt, false);
    if (ret === false || ret < 0) {
        console.log('\n*** Aborted');
        process.exit(0);
    }
    return ret;
}

function fail(msg) {
    console.log('*** ' + msg);
    process.exit(1);
}

function main() {
    var uid = process.getuid();
    if (process.env.OS !== 'LINUX') {
        fail('This script works on linux only.');
    }
    console.log([
        '',
        'This script generates an upstart script to automatically',
        'start your DecafJS server on boot and allow you to:',
        '   % start decaf',
        '   % stop decaf',
        '   % initctl status decaf',
        'etc.'
    ].join('\n'));
    var f = new File('/etc/init');
    if (!f.exists() || !f.isDirectory()) {
        fail('This script requires a system with upstart installed.');
    }
    if (uid !== 0) {
        fail('This script must be run as root, or use sudo.');
    }

    console.log([
        '',
        'Server Directory is the directory where your DecafJS WWW project',
        'is found.  Typically, the documentRoot is a subdirectory of',
        'the Server Directory.'
    ].join('\n'));
    var serverDir;

    while (true) {
        serverDir = gets('Server Directory: ');
        if (serverDir[0] !== '/') {
            console.log('*** ' + serverDir + ' is not an absolute path (begin with /)');
            continue;
        }
        if (!new File(serverDir).isDirectory()) {
            console.log('*** ' + serverDir + ' does not exist');
            continue;
        }
        break;
    }
    serverDir = serverDir.replace(/\/$/, '');

    console.log([
        '',
        'Bootstrap is the name of the .js file that is passed on the',
        'command line to decaf.'
    ].join('\n'));
    var bootstrap;
    while (true) {
        bootstrap = gets('Bootstrap filename: ');
        if (!new File(serverDir + '/' + bootstrap).exists()) {
            console.log('*** ' + serverDir + '/' + bootstrap + ' does not exist');
            continue;
        }
        break;
    }

    if (!new File(serverDir + '/' + bootstrap).exists()) {
        fail(serverDir + '/' + bootstrap + ' does not exist');
    }
    f = new File('/etc/init/decaf.conf');
    f.writeFile(upstartTemplate.replace(/{serverDir}/igm, serverDir).replace(/{bootstrap}/igm, bootstrap));

    console.log('file written to /etc/init/decaf.conf');
    console.log('  sudo start decaf');
    console.log('to start the server');
}
