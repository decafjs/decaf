/**
 * Created by mschwartz on 3/14/15.
 */

/* global describe, it */

var {suite, test, assert} = require('unit-test');

suite('File Module', function() {
    var File = require('File'),
        tmpdir = File.tmpDir;

    test('Require("File")', function() {
        assert(File, 'require of File failed');
        assert(typeof File === 'function', 'Expected File to be a constructor');
        assert(typeof File.pathSeparator === 'string', 'static File.pathSeparator is not a string');
        assert(File.pathSeparator === ':' || File.pathSeparator === ';', 'static File.pathSeparator expected to be ":" or ":"');
        assert(typeof File.separatorChar === 'string', 'static File.separatorChar is not a string');
        assert(File.separatorChar === '/' || File.separatorChar === '\\', 'static File.separatorChar expected to be "/" or "\\" ' + File.separatorChar);
    });

    test('createTempFile', function() {
        var f,
            name;

        assert(File.createTempFile, 'static File.createTempFile not present');
        assert(typeof File.createTempFile === 'function', 'static File.createTempFile is not a function');

        f = File.createTempFile();
        //f.deleteOnExit();

        assert(f instanceof File, 'Expected createTempFile to return a File instance');

        name = f.getName();
        assert(name.substr(0, 4) === 'tmp-', 'Expected temp filename to start with "tmp-"');
        assert(name.endsWith('.tmp'), 'Expected temp filename to end with .tmp');

        assert(f.getAbsolutePath() === tmpdir + name, 'Temp file absolute path is not expected value');

        assert(f.exists(), 'Temp file does not exist');
        assert(f.isFile(), 'Temp file is not a file');

        assert(f.canExecute() === false, function() {
            console.log('{path} should not be executable', { path: f.getAbsolutePath() });
        });

        assert(f.canRead() === true, 'Temp file is not readable');
        assert(f.canWrite() === true, 'Temp file is not writable');

        //console.dir(f.remove());
        assert(f.remove() === true, function() {
            console.log('Could not remove temp file ' + f.getAbsolutePath());
        });
        assert(f.exists() === false, 'Temp file was not removed ' + f.getAbsolutePath());
    });

});
