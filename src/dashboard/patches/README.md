# Vendored patches

This folder holds patches that [`patch-package`](https://github.com/ds300/patch-package)
applies to files inside `node_modules` after `npm install`. The
`postinstall` script in `package.json` runs `patch-package` automatically,
so the patches stay in effect across clean installs and CI runs.

## Why we need patches at all

Some of our transitive dependencies are unmaintained and ship code that
breaks on current Node.js versions. Forking and republishing those
packages (or pinning every consumer up the dependency chain) is more
disruptive than keeping a small, reviewable diff here.

Each patch is a unified diff against the version pinned in
`package-lock.json`. If a dependency is bumped to a version where the
patch no longer applies cleanly, `patch-package` fails loudly during
install — that's the signal to revisit the patch.

## Current patches

### `buffer-equal-constant-time+1.0.1.patch`

**What it patches:** `node_modules/buffer-equal-constant-time/index.js`

**Why:** The package (last released in 2014) does, at module top level:

```js
var SlowBuffer = require('buffer').SlowBuffer;
// ...
var origSlowBufEqual = SlowBuffer.prototype.equal;   // <- throws
```

`Buffer.SlowBuffer` was deprecated in Node.js v6 and has since been
removed from the `buffer` module. On any Node version that no longer
exposes `SlowBuffer`, requiring the file throws
`TypeError: Cannot read properties of undefined (reading 'prototype')`.

`buffer-equal-constant-time` is reached transitively from
`@azure/identity` → `@azure/msal-node` → `jsonwebtoken` → `jws` → `jwa`,
and the dashboard imports `@azure/identity` from
`services/cosmos-db-service.ts`, so the failure happens at request time
and the dashboard returns HTTP 500 on every page.

**The patch:** treats `SlowBuffer` as optional. If the runtime still
exposes it, behaviour is unchanged; if not, the module loads and `equal`
still works on `Buffer` instances (which is what `jws` actually uses).

## Updating or removing a patch

```sh
# Edit the file under node_modules/<package>, then:
npx patch-package <package>
```

This regenerates the patch file. Commit the regenerated `.patch` along
with whatever code change made it necessary.

To drop a patch entirely (e.g. once an upstream fix is released and the
dependency is bumped), delete the `.patch` file and run a clean
`npm install` to confirm nothing breaks.
