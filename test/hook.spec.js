const $mockRequire = require('mock-require');

let argv;
let $hook = require('../src/hook');
describe('Hook', () => {
    beforeEach(() => {
        argv = process.argv[2];
        process.argv[2] = '.git/';
    });
    afterEach(() => {
        process.argv[2] = argv;
    });

    it('should fail when there is no git commit message argument', () => {
        expect(() => {
            $hook.hook();
        }).toThrow();
    });

    it('should not fail when there is a valid commit message', () => {

        $mockRequire('fs', {
            readFileSync: () => 'bugfix: subject'
        });

        $hook = $mockRequire.reRequire('../src/hook');

        $hook.hook();

        $mockRequire.stop('fs');

    });

});
