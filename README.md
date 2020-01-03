'Monolith of Web': Chrome Extension Port of [Monolith][1]
=========================================================

'Monolith of Web' is a Chrome extension ported from CLI tool [Monolith][1]. Monolith is a CLI tool to
download a web page as static single HTML file. 'Monolith of Web' provides the same functionality as
a browser extension by compiling Monolith (written in Rust) into WebAssembly.

[Video on Youtube][2]

## Installation

- Install from [Chrome Web Store][3] (under review)
- Download `.crx` and install it manually

## Usage

![popup screenshot](./resources/popup.png)

1. Go to a web page you want to store
2. Click 'Monolith of Web' icon in a browser bar (above popup window will open)
3. Click 'Get Monolith' button
4. Wait for the process completing
5. The generated single static HTML file is stored in your downloads folder

By toggling icons at bottom of the popup window, you can determine to or not to include followings
in the generated HTML file.

- JavaScript
- CSS
- `<iframe/>`
- Images

## Permissions

- `activeTab`: This extension gets an HTML text and a page title from the active tab to generate a monolith

## Development

WebAssembly port of Monolith is developed in [the forked repository][4]. Currently it has some differences
and duplicates against the original repository. reqwest did not support Wasm before 0.10.0 so my Wasm
port does not use it and uses `fetch()` directly via `js_sys` and `web_sys` crate.

This repository adds the forked Monolith repository as a Git submodule and uses it by bundling sources
with Webpack.

## License

Distributed under [the MIT license](LICENSE).


[1]: https://github.com/Y2Z/monolith
[2]: https://www.youtube.com/watch?v=xBIrFlYE1W0
[3]: https://chrome.google.com/webstore/detail/koalogomkahjlabefiglodpnhhkokekg
[4]: https://github.com/rhysd/monolith
