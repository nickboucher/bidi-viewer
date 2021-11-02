# Bidi Viewer

Bidi Viewer is a React-based web utility that can be used to fetch source code files from anywhere online and scan for Bidi characters. It will display any line of code containing Bidi characters in its originally encoded form, and again with Bidi characters escaped for comparison.

This can be used to help identify the attacks described in [*Trojan Source: Invisible Vulnerabilities*](https://trojansource.codes).

## Live Deployment

A live version of this tool is hosted on GitHub Pages from this repo. Thanks, GitHub! 🚀 

[nickboucher.github.io/bidi-viewer](https://nickboucher.github.io/bidi-viewer)

## Installation

To run this locally, just clone the repo and:

```sh
cd bidi-viewer
npm install .
```

This utility was written for Node.js v16.8.0, so you may need to switch node versions if you run into installation issues.

## Usage

To use this utility, paste newline-separated URLs pointing to raw source code into the textbox. If you're using GitHub links, these should be raw code URLs such as:

[`https://raw.githubusercontent.com/nickboucher/trojan-source/main/C/commenting-out.c`](https://raw.githubusercontent.com/nickboucher/trojan-source/main/C/commenting-out.c)

If you paste multiple URLs, you can page through them with the left and right arrow keys.

Here's an example of what the above URL looks like in this tool:

![Bidi Viewer Screenshot](screenshot.png?raw=true "Bidi Viewer")