const $validator = require('../src/validator');
const $configure = require('../src/configure');
describe('Validator', () => {

    it('should mark these commits as valid', () => {

        const validCommitMessages = [
            'test(generic-error): build broken tests BW-509',
            'bugfix: remove handwritten fonts CFE-1337',
            'style(boarding-docs): minimize breakpoints image BW-447',
            'feature(filter): capturing filter selection through user state variables SFE-100',
            'bugfix(forms): fix broken unit test CFE-643',
            'bugfix(forms): no jira issue though',
            'bugfix(forms): no jira issue though\nwith a multiline\nvalue',
            'bugfix(forms): no jira issue though\rwith a multiline\rvalue',
            'bugfix(forms): no jira issue though\r\nwith a multiline\r\nvalue'
        ];

        const errors = [];
        validCommitMessages.forEach(commitMessage => {
            try {
                $validator.validate(commitMessage);
            } catch (e) {
                errors.push({
                    commitMessage: commitMessage,
                    error: e
                });
            }
            expect(errors).toEqual([]);
        });

    });

    it ('should mark these commits as invalid', () => {

        const ERRORS = $configure.configure().errors;

        const invalidCommitMessages = [
            ['type-only', ERRORS.TYPE_AND_SUBJECT_REQUIRED.message],
            ['\nmultiline value with empty first line', ERRORS.TYPE_AND_SUBJECT_REQUIRED.message],
            ['\rmultiline value with empty first line', ERRORS.TYPE_AND_SUBJECT_REQUIRED.message],
            ['\r\nmultiline value with empty first line', ERRORS.TYPE_AND_SUBJECT_REQUIRED.message],
            ['type-only-with-colon:', ERRORS.TYPE_AND_SUBJECT_REQUIRED.message],
            ['type(scope)only', ERRORS.TYPE_AND_SUBJECT_REQUIRED.message],
            ['type(scope)only-with-colon:', ERRORS.TYPE_AND_SUBJECT_REQUIRED.message],
            ['type(open scope: subj', ERRORS.TYPE_SCOPE_MALFORMED.message],
            ['type : no space before colon', ERRORS.NO_SPACE_BEFORE_COLON.message],
            ['type:no space before subject', ERRORS.REQUIRE_SPACE_AFTER_COLON.message],
            ['type: abc-123', ERRORS.SUBJECT_REQUIRED.message],
            ['type: some subject abc-123', ERRORS.JIRA_ISSUE_CAPITALIZED.message],
            ['type: some subject.', ERRORS.SUBJECT_DONT_END_ON_CHARS.message],
            ['invalidType: some subject', ERRORS.TYPE_INVALID.message],
            ['bugfix(): some subject', ERRORS.SCOPE_EMPTY.message]
        ];

        invalidCommitMessages.forEach(errorCase => {
            const [commitMessage, errorMessage] = errorCase;

            expect(() => {
                $validator.validate(commitMessage);
            }).toThrow(new Error(errorMessage));

        });

    });

    it('should allow a custom config', () => {

        expect(() => {
            $validator.validate('custom: type', {types: ['custom']});
        }).not.toThrow();

        expect(() => {
            $validator.validate('weird: type', {types: ['bugfix']});
        }).toThrow();

    });

    it('should allow custom scope validation', () => {

        expect(() => {
            $validator.validate('bugfix(custom): subject', {types: ['bugfix'], scopes: ['custom']});
        }).not.toThrow();

        expect(() => {
            $validator.validate('bugfix(invalid): subject', {types: ['bugfix'], scopes: ['custom']});
        }).toThrow();

    });

});
