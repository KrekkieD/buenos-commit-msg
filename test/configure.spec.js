const $path = require('path');

const $mockRequire = require('mock-require');

let $configure = require('../src/configure');
describe('Configuration', () => {

    it('should return a parsed configuration object', () => {
        const config = $configure.configure();
        expect(Object.keys(config)).toEqual(['types', 'scopes', 'errors']);
    });

    it('should parse the key/value errors to key/obj errors', () => {
        const config = $configure.configure();
        const errors = config.errors;

        let i = 0;

        Object.keys(errors).forEach(error => {
           expect(Object.keys(errors[error])).toEqual(['code', 'message']);
           i++;
        });

        expect(i).toBe(Object.keys(errors).length);

    });

    it('should error on invalid config files', () => {

        $mockRequire('up-the-tree', () => $path.resolve(__dirname, 'assets/malformatted-config.json'));

        expect(() => {
            $configure = $mockRequire.reRequire('../src/configure');
            $configure.configure();
        }).toThrow();

        $mockRequire.stop('up-the-tree');

    });

    it('should be able to merge config files', () => {

        $mockRequire('up-the-tree', () => $path.resolve(__dirname, 'assets/merge-config.json'));

        $configure = $mockRequire.reRequire('../src/configure');
        const config = $configure.configure();

        expect(config.types.indexOf('customType1')).toBeGreaterThan(-1);
        expect(config.types.indexOf('customType2')).toBeGreaterThan(-1);
        expect(config.scopes).toEqual(['customScope1', 'customScope2']);

        $mockRequire.stop('up-the-tree');

    });

    it('should be able to merge config files where properties are left out', () => {

        $mockRequire('up-the-tree', () => $path.resolve(__dirname, 'assets/merge-config--no-arrays.json'));

        $configure = $mockRequire.reRequire('../src/configure');
        const config = $configure.configure();

        expect(Array.isArray(config.types)).toBe(true);
        expect(config.types.length).toBeGreaterThan(0);
        expect(Array.isArray(config.scopes)).toBe(true);

        $mockRequire.stop('up-the-tree');

    });

    it('should be able to merge config files using extend if extend is not specified', () => {

        $mockRequire('up-the-tree', () => $path.resolve(__dirname, 'assets/merge-config--inexplicit-extend.json'));

        $configure = $mockRequire.reRequire('../src/configure');
        const config = $configure.configure();

        expect(config.types.indexOf('customType1')).toBeGreaterThan(-1);
        expect(config.types.indexOf('customType2')).toBeGreaterThan(-1);
        expect(config.scopes).toEqual(['customScope1', 'customScope2']);

        $mockRequire.stop('up-the-tree');

    });

    it('should be able to merge config files where extend is set to false', () => {

        $mockRequire('up-the-tree', () => $path.resolve(__dirname, 'assets/merge-config--no-extend.json'));

        $configure = $mockRequire.reRequire('../src/configure');
        const config = $configure.configure();

        expect(Array.isArray(config.types)).toBe(true);
        expect(config.types.length).toBe(0);
        expect(Array.isArray(config.scopes)).toBe(true);
        expect(config.scopes.length).toBe(0);

        $mockRequire.stop('up-the-tree');

    });

    it('should properly parse the placeholders in error messages', () => {

        $mockRequire('up-the-tree', () => $path.resolve(__dirname, 'assets/merge-config.json'));

        $configure = $mockRequire.reRequire('../src/configure');
        const config = $configure.configure();

        expect(config.errors.TYPE_INVALID.message.indexOf('customType1')).toBeGreaterThan(-1);
        expect(config.errors.TYPE_INVALID.message.indexOf('customType2')).toBeGreaterThan(-1);
        expect(config.errors.SCOPE_INVALID.message.indexOf('customScope1')).toBeGreaterThan(-1);
        expect(config.errors.SCOPE_INVALID.message.indexOf('customScope2')).toBeGreaterThan(-1);

        $mockRequire.stop('up-the-tree');

    });

    it('should be able to overwrite error messages', () => {

        $mockRequire('up-the-tree', () => $path.resolve(__dirname, 'assets/merge-config--error-messages.json'));

        $configure = $mockRequire.reRequire('../src/configure');
        const config = $configure.configure();

        expect(config.errors.TYPE_INVALID.message.indexOf('%types%')).toBe(-1);
        expect(config.errors.TYPE_INVALID.message.indexOf('custom error')).toBe(0);
        expect(config.errors.SCOPE_INVALID.message.indexOf('%scopes%')).toBe(-1);
        expect(config.errors.SCOPE_INVALID.message.indexOf('custom error')).toBe(0);
        expect(Object.keys(config.errors).length).toBeGreaterThan(2);

        $mockRequire.stop('up-the-tree');

    });

    it('should be able to overwrite error messages with a custom config', () => {

        $configure = $mockRequire.reRequire('../src/configure');
        const config = $configure.configure({
            types: [
                'customType1'
            ],
            scopes: [
                'customScope1'
            ],
            errors: {
                TYPE_INVALID: 'custom error %types%',
                SCOPE_INVALID: 'custom error %scopes%'
            }
        });

        expect(config.errors.TYPE_INVALID.message.indexOf('%types%')).toBe(-1);
        expect(config.errors.TYPE_INVALID.message.indexOf('custom error')).toBe(0);
        expect(config.errors.SCOPE_INVALID.message.indexOf('%scopes%')).toBe(-1);
        expect(config.errors.SCOPE_INVALID.message.indexOf('custom error')).toBe(0);
        expect(Object.keys(config.errors).length).toBeGreaterThan(2);

    });

});
