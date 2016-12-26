![Global Twitch Emotes banner](/assets/banner.png)

A browser extension which replaces all Twitch.tv emote phrases with their actual emoticons.

Currently supports Chrome, Firefox, and Opera. Edge support is planned, Safari support is not.

##  Building

Global Twitch Emotes is built using Node.js. Download and install the latest version of Node.js [here](https://nodejs.org/).

1.  Navigate to the parent directory.
2.  Run ```npm install```
3.  Then run <pre>npm run-script build_<b>BROWSER VERSION</b></pre> 

    **BROWSER:** The browser type you want to build for.

    `chrome` | `firefox`

    **VERSION:** Extension version to build.

    `test` | `release`

    *Release builds are minified and zipped into a .zip file for distribution, whilst test builds are not minified, to allow for easier debugging.*

##  Installation and Testing

Most browser will allow you to sideload unpacked extensions for testing. Please refer to your browser's extension installation guide.

##  Support

For inquiries, please either [contact me](mailto:mohamed.y.elalawi@gmail.com) or [open an issue](https://github.com/melalawi/GlobalTwitchEmotes/issues/new).
