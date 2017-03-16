const $validator = require('./');

// test run
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

try {
    validCommitMessages.forEach(commitMessage => {
        $validator.validate(commitMessage);
        console.log('TESTED VALID:', `"${commitMessage}"`);
    });
} catch (e) {
    console.log('\n*** TEST FAILURE: ***');
    console.log('Broke on:');
    console.log(e.message);
    console.log(e.parsedCommitMessage);
    console.log('*** /TEST FAILURE ***\n');
}


const invalidCommitMessages = [
    ['type-only', $validator.ERRORS.TYPE_AND_SUBJECT_REQUIRED.message],
    ['\nmultiline value with empty first line', $validator.ERRORS.TYPE_AND_SUBJECT_REQUIRED.message],
    ['\rmultiline value with empty first line', $validator.ERRORS.TYPE_AND_SUBJECT_REQUIRED.message],
    ['\r\nmultiline value with empty first line', $validator.ERRORS.TYPE_AND_SUBJECT_REQUIRED.message],
    ['type-only-with-colon:', $validator.ERRORS.TYPE_AND_SUBJECT_REQUIRED.message],
    ['type(scope)only', $validator.ERRORS.TYPE_AND_SUBJECT_REQUIRED.message],
    ['type(scope)only-with-colon:', $validator.ERRORS.TYPE_AND_SUBJECT_REQUIRED.message],
    ['type(open scope: subj', $validator.ERRORS.TYPE_SCOPE_MALFORMED.message],
    ['type : no space before colon', $validator.ERRORS.NO_SPACE_BEFORE_COLON.message],
    ['type:no space before subject', $validator.ERRORS.REQUIRE_SPACE_AFTER_COLON.message],
    ['type: abc-123', $validator.ERRORS.SUBJECT_REQUIRED.message],
    ['type: some subject abc-123', $validator.ERRORS.JIRA_ISSUE_CAPITALIZED.message],
    ['type: some subject.', $validator.ERRORS.SUBJECT_DONT_END_ON_CHARS.message],
    ['invalidType: some subject', $validator.ERRORS.TYPE_INVALID.message],
    ['bugfix(): some subject', $validator.ERRORS.SCOPE_EMPTY.message]
];

invalidCommitMessages.forEach(errorCase => {
    const [commitMessage, errorMessage] = errorCase;
    try {
        $validator.validate(commitMessage);

        const error = new Error('Did not break');
        error.parsedCommitMessage = {
            full: commitMessage
        };
        throw error;

    } catch (e) {
        if (e.message !== errorMessage) {
            console.log('\n*** TEST FAILURE: ***');
            console.log('Should have broken with:');
            console.log(errorMessage);
            console.log('But broke on:');
            console.log(e.message);
            console.log(e.parsedCommitMessage);
            console.log('*** /TEST FAILURE ***\n');
        } else {
            console.log('TESTED INVALID:', `"${commitMessage}"`, '\n\tWITH ERROR:', errorMessage);
        }
    }
});
