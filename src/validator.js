// TODO: read allowed types from JSON
// TODO: read allowed scopes from JSON

const ALLOWED_TYPES = 'bugfix|build|ci|docs|feature|format|merge|perf|refactor|style|test|version'.split('|');

const ERRORS = {
    TYPE_AND_SUBJECT_REQUIRED: {
        code: 'TYPE_AND_SUBJECT_REQUIRED',
        message: 'At least a type and subject is required'
    },
    TYPE_SCOPE_MALFORMED: {
        code: 'TYPE_SCOPE_MALFORMED',
        message: 'Type and scope should be formatted as \'type(scope):\''
    },
    REQUIRE_SPACE_AFTER_COLON: {
        code: 'REQUIRE_SPACE_AFTER_COLON',
        message: 'add a space before subject'
    },
    NO_SPACE_BEFORE_COLON: {
        code: 'NO_SPACE_BEFORE_COLON',
        message: 'no space before the colon'
    },
    SUBJECT_ISSUE_MALFORMED: {
        code: 'SUBJECT_ISSUE_MALFORMED',
        message: 'Subject and issue should be formatted as \'some subject ISS-123\''
    },
    JIRA_ISSUE_CAPITALIZED: {
        code: 'JIRA_ISSUE_CAPITALIZED',
        message: 'JIRA reference should be in full caps'
    },
    SUBJECT_REQUIRED: {
        code: 'SUBJECT_REQUIRED',
        message: 'Subject is required, even if a JIRA issue is provided'
    },
    SUBJECT_DONT_END_ON_CHARS: {
        code: 'SUBJECT_DONT_END_ON_CHARS',
        message: 'Subject should not end on dot (.) or colon (:)'
    },
    TYPE_INVALID: {
        code: 'TYPE_INVALID',
        message: `Type should be one of: "${ALLOWED_TYPES.join('", "')}"`
    },
    SCOPE_EMPTY: {
        code: 'SCOPE_EMPTY',
        message: 'Scope should have a value or be left out entirely'
    }
};

module.exports = {
    ERRORS: ERRORS,
    validate: validate
};

function validate (commitMessage) {

    const parsedCommitMessage = {
        full: commitMessage,
        firstLine: commitMessage.split(/\r\n|\r|\n/).shift()
    };

    // confirm both the type (and scope) and subject (and/or issue) are provided
    try {
        const [typeAndScope, subjectAndIssue] = /^([^:]+):(.+)$/.exec(parsedCommitMessage.firstLine).slice(1);
        parsedCommitMessage.typeAndScope = typeAndScope;
        parsedCommitMessage.subjectAndIssue = subjectAndIssue;
    } catch (e) {
        _reject(ERRORS.TYPE_AND_SUBJECT_REQUIRED);
    }

    // confirm there is no space before the colon
    if (parsedCommitMessage.typeAndScope !== parsedCommitMessage.typeAndScope.trim()) {
        _reject(ERRORS.NO_SPACE_BEFORE_COLON);
    }
    // confirm there is a space after the colon
    if (!parsedCommitMessage.subjectAndIssue.match(/^\s.*$/)) {
        _reject(ERRORS.REQUIRE_SPACE_AFTER_COLON);
    }

    // extract the type and optional scope
    try {
        const [type, scope] = /^([^()]+)(?:\((.*)\))?$/.exec(parsedCommitMessage.typeAndScope).slice(1);
        parsedCommitMessage.type = type;
        parsedCommitMessage.scope = scope;
    } catch (e) {
        _reject(ERRORS.TYPE_SCOPE_MALFORMED);
    }

    // extract the subject and optional JIRA issue
    try {
        const [subject, issue] = /^(.*?)(?:\s([a-z]{2,5}-\d+))?$/i.exec(parsedCommitMessage.subjectAndIssue).slice(1);
        parsedCommitMessage.subject = subject;
        parsedCommitMessage.issue = issue;
    } catch (e) {
        _reject(ERRORS.SUBJECT_ISSUE_MALFORMED);
    }

    // confirm there is a subject
    if (!parsedCommitMessage.subject) {
        _reject(ERRORS.SUBJECT_REQUIRED);
    }

    // confirm jira issue is uppercased when provided
    if (parsedCommitMessage.issue && parsedCommitMessage.issue.toUpperCase() !== parsedCommitMessage.issue) {
        _reject(ERRORS.JIRA_ISSUE_CAPITALIZED);
    }

    // confirm subject does not end with a colon or dot
    if (/.+[.:]$/.test(parsedCommitMessage.subject)) {
        _reject(ERRORS.SUBJECT_DONT_END_ON_CHARS);
    }

    // verify type is one of the allowed types
    if (ALLOWED_TYPES.indexOf(parsedCommitMessage.type) === -1) {
        _reject(ERRORS.TYPE_INVALID);
    }

    if (!parsedCommitMessage.scope && typeof parsedCommitMessage.scope !== 'undefined') {
        _reject(ERRORS.SCOPE_EMPTY);
    }

    return parsedCommitMessage;

    function _reject (error) {
        const throwable = new Error(error.message);
        throwable.code = error.code;
        throwable.parsedCommitMessage = parsedCommitMessage;
        throw throwable;
    }
}

