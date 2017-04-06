# buenos-commit-msg

Validates your commit message format to match the format:
```
<type>(<scope>): <subject> <issue>
```

Note that `scope` is optional, and the `issues` (if provided) should match a JIRA format (i.e. `ISS-123`).

## Usage

Simply install as a dev dependency:

```bash
$ npm install --save-dev buenos-commit-msg
```

and create a hook on `commit-msg` (i.e. `.git/hooks/commit-msg`):  
**note:** make sure the file is executable (`$ chmod +x path/to/file`)  

```javascript
#!/usr/bin/env node

try {
    require('buenos-commit-msg').hook();
} catch (e) {
    console.log(e.message);
    process.exit(1);
}
```

See https://www.npmjs.com/package/git-hooks for a cool implementation of git-hooks.

## Configuration

It's possible to configure the allowed `type` and `scope` properties by creating a file called `.commit-msg.json` in the root of your project:

```json
{
  "extend": true,
  "types": [
    "customType1",
    "customType2"
  ],
  "scopes": [
    "customScope1",
    "customScope2"
  ],
  "errors": {
    "TYPE_AND_SUBJECT_REQUIRED": "Type and subject is required"
  }
}
```

### extend

When `false`, the `types` and `scopes` will be overwritten with your values. When `true` or unspecified, the `types` and `scopes` you've defined will be added to the default values.

### types

A case-sensitive array of allowed types. Default values are `bugfix`, `build`, `ci`, `docs`, `feature`, `format`, `merge`, `perf`, `refactor`, `style`, `test`, `version`.

Set to an empty array to allow any type.

### scopes

A case-sensitive array of allowed scopes. By default all values are allowed.

Set to an empty array to allow any scope.

### errors

Allows customizing the error messages.

The following errors are specified and can be overwritten:

```
{
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
}
```

Note that `%types%` and `%scopes%` will be replaced with a joined value of types and scopes for errors `TYPE_INVALID` and `SCOPE_INVALID`.

Also note that any errors that you don't specify will always be filled from the default config.

## API

### hook()

Runs the validator, uses the git commit message as provided by git and uses a config file if it finds one, or falls back to the default config.

This is probably what you want for your git hook.

### getCommitMessage()

Retrieves the commit message as provided by git. Can be useful if you want a fancier git hook.

### configure(config = undefined)

Creates and returns a configuration object that can be used in `validate()`. 

When `config` argument is not provided it will use the default config combined with a custom config file if it finds one.

When `config` is an object it will use that.

### validate(commitMessage, config = undefined)

Validates the commitMessage using the provided configuration object. If no config is specified the default config will be used.

It will return the validation object when the message was successfully validated, or will throw an error when a validation error has occured.

---

Derived from the Angular [Commit Messages Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)
