var utils = require('../lib/utils');

exports['propertyPath'] = function (test) {
    var obj = {test: 'test'};
    utils.setPropertyPath(obj, 'some/example/path.js', 'val');
    test.same(obj, {test: 'test', some: {example: {path: 'val'}}});
    utils.setPropertyPath(obj, 'some/other/path.js', 'val2');
    test.same(obj, {
        test: 'test',
        some: {
            example: {path: 'val'},
            other: {path: 'val2'}
        }
    });
    utils.setPropertyPath(obj, './test', 'test2');
    test.same(obj, {
        test: 'test2',
        some: {
            example: {path: 'val'},
            other: {path: 'val2'}
        }
    });
    test.done();
};

exports['descendants'] = function (test) {
    var dir = __dirname + '/fixtures/descendants_test';
    utils.descendants(dir, function (err, files) {
        if(err) throw err;
        test.same(files.sort(), [
            dir + '/file1',
            dir + '/file2',
            dir + '/folder1/file1.1',
            dir + '/folder2/folder2.1/file2.1.1',
            dir + '/folder2/folder2.2/file2.2.1',
            dir + '/folder2/folder2.2/file2.2.2'
        ].sort());
        test.done();
    });
};

exports['readJSON'] = function (test) {
    test.expect(2);
    var p = __dirname + '/fixtures/valid_json';
    utils.readJSON(p, function (err, settings) {
        test.ok(!err);
        test.same(settings, {one:1,two:2});
        test.done();
    });
};

exports['readJSON'] = function (test) {
    test.expect(1);
    var p = __dirname + '/fixtures/invalid_json';
    utils.readJSON(p, function (err, settings) {
        test.ok(err, 'return JSON parsing errors');
        test.done();
    });
};

exports['relpath'] = function (test) {
    var dir = '/some/test/path';
    test.equals(
        utils.relpath('/some/test/path/some/file.ext', dir),
        'some/file.ext'
    );
    test.equals(
        utils.relpath('/some/test/file.ext', dir),
        '../file.ext'
    );
    test.equals(
        utils.relpath('some/test/file.ext', dir),
        'some/test/file.ext'
    );
    test.equals(
        utils.relpath('/some/dir/../test/path/file.ext', dir),
        'file.ext'
    );
    test.equals(utils.relpath('file.ext', dir), 'file.ext');
    test.done();
};

exports['stringifyFunctions'] = function (test) {
    var Script = process.binding('evals').Script;
    var obj = {
        a: {
            // this is not an instanceof Function but is
            // typeof 'function'...
            b: Script.runInNewContext("(function (){return 'fn1';})"),
            // this is an instanceof Function, and also typeof
            // Function
            c: function (){return 'fn2';},
            d: 123,
        },
        e: true,
        f: null,
        g: undefined
    }
    var stringified = utils.stringifyFunctions(obj);
    test.same(
        stringified,
        {
            a: {
                b: "function (){return 'fn1';}",
                c: "function (){return 'fn2';}",
                d: 123,
            },
            e: true,
            f: null,
            g: undefined
        }
    );
    // deepEquals seems to test the string representations of functions
    // so we also need to test the type is correct
    test.equals(typeof stringified.a.b, 'string');
    test.equals(typeof stringified.a.c, 'string');
    test.done();
};

exports.evalSandboxed = function (test) {
    test.expect(5);
    var obj = {test: 'test'};
    try { utils.evalSandboxed("require('sys').puts('fail!')"); }
    catch (e) { test.ok(e, 'should throw an error'); }
    try { utils.evalSandboxed("process.env['HOME']")}
    catch (e) { test.ok(e, 'should throw an error'); }
    try { utils.evalSandboxed("obj.test = 'asdf'")}
    catch (e) { test.ok(e, 'should throw an error'); }
    test.equals(obj.test, 'test');
    test.same(utils.evalSandboxed("{a: {b: 123}}"), {a: {b: 123}});
    test.done();
};
