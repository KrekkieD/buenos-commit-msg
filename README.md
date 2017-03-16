# buenos-commit-msg

Validates your commit message format to match the format:
```
<type>(<scope>): <subject> <issue>
```

## Usage

Simply install as a dev dependency and create a hook on `commit-msg`:

```javascript
#!/usr/bin/env node

require('buenos-commit-msg');
```

## Configuration

It's possible to configure the allowed `type` and `scope` properties by creating a file called `.commit-msg.json` in the root of your project:

```json
{
  "types": [
    "customType1",
    "customType2"
  ],
  "scopes": [
    "customScope1",
    "customScope2"
  ]
}
```

By default any `scope` is valid, and `type` is restricted to one of `bugfix`, `build`, `ci`, `docs`, `feature`, `format`, `merge`, `perf`, `refactor`, `style`, `test`, `version`.
