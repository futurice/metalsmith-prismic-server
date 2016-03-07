# metalsmith-prismic-server

A library for defining servers which compile static sites from content hosted on [prismic.io](https://prismic.io/) using the [metalsmith](http://metalsmith.io/) static site generator.

Intended primarily for use with [metalsmith-prismic-template](https://github.com/futurice/metalsmith-prismic-template).

### Capabilities

- *Preview Content*

  Prismic's content editing interface has a disabled-by-default feature which allows one to preview the rendered versions of unpublished changes. This library enables that feature by providing a server endpoint which Prismic can call to trigger rendering of the unpublished content, and to redirect the user to that rendered content.

- *Build and Deploy Published Changes*

  This library provides a webhook which Prismic may be configured to ping whenever new content is published or existing content is changed. The exact behaviour of this webhook is configurable via metalsmith plugins, but is intended for building and deploying the static site resources.

- *Live Reloading Development Mode*

  A local version of the build server may be run during template development which watches the local file system for changes. The local rendered version of the site is hosted and served to a browser. When changes are detected, the site is rebuilt and any documents open in the browser are automatically reloaded to avoid the need for manual refreshing.

### Configuration

See [src/config.js](src/config.js) for the full list and descriptions of available options. Note that some take their default value from environment variables.

You should specify these options in a plain javascript object which should be passed to any of the top-level functions.

### API

See `spec.md` for a more detailed explanation.

#### `prod(config)`

Runs the production server which has two endpoints:

- `/preview`

  Give this endpoint to prismic to enable previews.

- `/build`

  Give this endpoint (+ the webhook secret defined in the config) to prismic to enable
  build/deploy automation.

It also serves the latest master build at `/builds/master`.

#### `dev(config)`

Runs the local development server.

#### `build(config, modes)`

Runs the build once only, using the given modes (which should be an array of strings which correspond to properties in config.plugins)
