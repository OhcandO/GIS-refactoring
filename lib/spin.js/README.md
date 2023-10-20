# spin.js [![JS.ORG](https://img.shields.io/badge/js.org-spin-ffb400.svg?style=flat-square)](http://js.org)

An animated loading spinner

 * No images
 * No dependencies
 * Highly configurable
 * Resolution independent
 * Uses CSS keyframe animations
 * Works in all major browsers
 * Includes TypeScript definitions
 * Distributed as a native ES6 module
 * MIT License

## Installation

`npm install spin.js`

## Usage

### CSS

```html
<link rel="stylesheet" href="node_modules/spin.js/spin.css">
```

### TypeScript or JavaScript

```javascript
import {Spinner} from 'spin.js';

var target = document.getElementById('foo');
new Spinner({color:'#fff', lines: 12}).spin(target);
```

```javascript

//----SPINNER 실제 사용한 방법

 let op = {
     lines: 15,
     length: 38,
     width: 12,
     radius: 38,
     scale: 1,
     corners: 1,
     speed: 1,
     rotate: 0,
     animation: "spinner-line-fade-more",
     direction: "1",
     color: "#ffffff",
     fadeColor: "transparent",
     top: "50%",
     left: "50%",
     shadow: "grey 3px 4px 8px 1px",
     zIndex: 2000000000,
     className: "spinner",
     position: "absolute",
 };

let spin = new Spinner(op).spin(document.querySelector('#map'));

globalThis.spin = spin;
```

For an interactive demo and a list of all supported options please refer to the [project's homepage](https://spin.js.org).
