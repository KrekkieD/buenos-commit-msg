const $upTheTree = require('up-the-tree');

module.exports = {
    configure: configure
};

function configure (config) {

    if (typeof config === 'undefined') {
        const parsedConfig = _getDefaults();

        const configFilePath = $upTheTree('./.commit-msg.json', {resolve: true});
        if (configFilePath) {
            try {
                const customConfig = require(configFilePath);

                if (customConfig.extend !== false) {
                    parsedConfig.types = parsedConfig.types.concat(Array.isArray(customConfig.types) ? customConfig.types : []);
                    parsedConfig.scopes = parsedConfig.scopes.concat(Array.isArray(customConfig.scopes) ? customConfig.scopes : []);
                }
                else {
                    parsedConfig.types = customConfig.types || [];
                    parsedConfig.scopes = customConfig.scopes || [];
                }

                // filter types and scopes to only have unique values
                parsedConfig.types = Array.from(new Set(parsedConfig.types));
                parsedConfig.scopes = Array.from(new Set(parsedConfig.scopes));

                parsedConfig.errors = _extendErrors(parsedConfig.errors, customConfig.errors || {});

            } catch (e) {
                throw new Error(`Config file at "${configFilePath}" is not valid json`);
            }
        }

        parsedConfig.errors = _parseErrors(parsedConfig);

        return parsedConfig;
    }
    else {
        const defaultConfig = _getDefaults();

        config.errors = _extendErrors(defaultConfig.errors, config.errors || {});
        config.errors = _parseErrors(config);
        return config;
    }

}

function _extendErrors (defaultErrors, customErrors) {
    const errors = Object.assign({}, defaultErrors);

    Object.keys(customErrors).forEach(errorCode => {
        errors[errorCode] = customErrors[errorCode];
    });

    return errors;
}

function _parseErrors (config) {
    const errors = Object.keys(config.errors).reduce((acc, error) => {
        acc[error] = typeof config.errors[error] === 'object' ? config.errors[error] : {
            code: error,
            message: config.errors[error]
        };
        return acc;
    }, {});

    // patch placeholders in errors
    errors.TYPE_INVALID.message = errors.TYPE_INVALID.message.replace('%types%', (config.types || []).join(', '));
    errors.SCOPE_INVALID.message = errors.SCOPE_INVALID.message.replace('%scopes%', (config.scopes || []).join(', '));

    return errors;
}

function _getDefaults () {

    const defaults = {};
    defaults.types = [
        'bugfix',
        'build',
        'ci',
        'docs',
        'feature',
        'format',
        'merge',
        'perf',
        'refactor',
        'style',
        'test',
        'version'
    ];
    defaults.scopes = [];
    defaults.errors = {
        TYPE_AND_SUBJECT_REQUIRED: 'At least a type and subject is required',
        TYPE_SCOPE_MALFORMED: 'Type and scope should be formatted as \'type(scope):\'',
        REQUIRE_SPACE_AFTER_COLON: 'Add a space before subject',
        NO_SPACE_BEFORE_COLON: 'No space before the colon',
        SUBJECT_ISSUE_MALFORMED: 'Subject and issue should be formatted as \'some subject ISS-123\'',
        JIRA_ISSUE_CAPITALIZED: 'JIRA reference should be in full caps',
        SUBJECT_REQUIRED: 'Subject is required, even if a JIRA issue is provided',
        SUBJECT_DONT_END_ON_CHARS: 'Subject should not end on dot (.) or colon (:)',
        TYPE_INVALID: `Type should be one of: %types%`,
        SCOPE_INVALID:`Type should be one of: %scopes%`,
        SCOPE_EMPTY: 'Scope should have a value or be left out entirely'
    };

    return defaults;
}
