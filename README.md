# OpenSeaDragonAreaSelector

This OpenSeaDragon plugin introduces a new feature for selecting, moving and resizing areas within the viewer.

![osdselector](https://cloud.githubusercontent.com/assets/1356335/7264166/e7f94190-e8dc-11e4-88f9-8a62e5a1aefc.gif)

## Features

 * Create + attach an area selector to a viewer.
 * Init location + size
 * Click and drag to move the area selector.
 * Click and drag handles (corners / edges) to resize.
 * Constrain position+size to the maximum bounds of a user-defined area, such as the edge of an image.
 * Mobile devices supported.

## Usage

Include `areaselector.js` in your project

```javascript
var selector = new OpenSeaDragon.AreaSelector({
    viewer: viewer,
    visible: true
});
```

or

```javascript
var selector = viewer.activateAreaSelector({
    //options
});
```
