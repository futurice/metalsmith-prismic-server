# English description of the server system

## High level overview

The server has two mutually-exclusive modes:

- Production

  Intended to be run on Heroku or similar. Compiles and deploys the client's site when changes are made to content hosted on prismic, or when templates hosted in a github repository are changed. Also enables previewing of content from the prismic editor.

- Development

  Intended for local use by a person developing templates for a client's site. Watches the input files in the local file system for changes and builds the site to some directory also on the local file system, which is served locally over http. Does not react to changes in prismic content automatically (having prismic ping one's local dev machine is not really feasible).


## Medium Level Details
### Development Server

Builds the site on startup, pulling in the latest content from prismic.

Watches the file system for changes to input files and builds the site when
changes are detected, pulling in the latest changes from prismic, and automatically triggering a live reload of the content if it is being viewed in the developer's browser.

Configuration options passed via command line, env, or constructor:

 - source path map to watch for changes
 - prismic url & access token
 - port to run server on


### Production Server

Builds the site on startup, pulling in the latest content from prismic.

Hosts static content under a `/builds/:build-id` path.

Waits for requests from prismic.io on two routes:

- `POST /build` which:

  - will be called by prismic when changes are published. And maybe at other times because prismic is weird?
  - takes two parameters as JSON:

    - prismicSecret: prismic webhook secret
    - prismicUrl: url of prismic app

    these are both validated as being identical to ones the template is configured to use. On failure HTTP status code 400 is returned before any of the following can happen.
  - invokes metalsmith on the current project, pulling in the latest content from prismic.
  - returns HTTP status code 200

- `GET /preview` which:

  - will be called by prismic when the client clicks the preview button in the prismic editor.
  - takes one parameter, `token`, which is a URL pointing to the prismic-hosted document the client wishes to preview. (if not specified, the page to be previewed is the root page)
  - removes preview builds which have outlasted their lifetime (maybe this should be done by a daemon of some kind once in a while to make this route a little more performant, unless we have really serious space requirements)
  - builds and serves the preview version of the site

    - pulling in all the relevant data from prismic
    - replacing absolute URL targets with preview-qualified ones (under the `/builds/` path)
    - injecting prismic's preview page script
    - setting a cookie on the page so that the prismic preview widget displays correctly.

Configuration options passed via command line, env, or through constructor:

 - prismic url & access token & webhook secret
 - port to run server on
