const $configure = require('./configure');

module.exports = {
    validate: validate
};

function validate (commitMessage, config) {

    config = $configure.configure(config);

    const TYPES = config.types;
    const SCOPES = config.scopes;
    const ERRORS = config.errors;

    const parsedCommitMessage = {
        config: config,
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
    if (TYPES && TYPES.length && TYPES.indexOf(parsedCommitMessage.type) === -1) {
        _reject(ERRORS.TYPE_INVALID);
    }

    if (typeof parsedCommitMessage.scope !== 'undefined') {
        // confirm scope is not empty (falsy)
        if (!parsedCommitMessage.scope) {
            _reject(ERRORS.SCOPE_EMPTY);
        }

        // confirm scope is one of the allowed types
        if (SCOPES && SCOPES.length && SCOPES.indexOf(parsedCommitMessage.scope) === -1) {
            _reject(ERRORS.SCOPE_INVALID);
        }
    }

    return parsedCommitMessage;

    function _reject (error) {
        const throwable = new Error(error.message);
        throwable.code = error.code;
        throwable.parsedCommitMessage = parsedCommitMessage;
        throw throwable;
    }
}

