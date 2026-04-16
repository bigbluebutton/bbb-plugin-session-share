# Session Share Plugin

## What is it?

This plugin allows the user to share the current session in two ways:

1. Share current session
2. Invite other users

![Gif of plugin demo](./public/assets/plugin.gif)

## Building the Plugin

To build the plugin for production use, follow these steps:

```bash
cd $HOME/src/bbb-plugin-session-share
npm ci
npm run build-bundle
```

The above commands will generate the `dist` folder, containing the bundled JavaScript file named `SessionSharePlugin.js`. This file can be hosted on any HTTPS server along with its `manifest.json`.

If you install the plugin separated from the manifest, remember to change the `javascriptEntrypointUrl` in the `manifest.json` to the correct endpoint.

To use the plugin in BigBlueButton, send this parameter along in create call:

```
pluginManifests=[{"url":"<your-domain>/path/to/manifest.json"}]
```

Or additionally, you can add this same configuration in the `.properties` file from `bbb-web` in `/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties`


## Development mode

As for development mode (running this plugin from source), please, refer back to https://github.com/bigbluebutton/bigbluebutton-html-plugin-sdk section `Running the Plugin from Source`
