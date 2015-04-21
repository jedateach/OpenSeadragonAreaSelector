# OpenSeaDragonAreaSelector

This OpenSeaDragon plugin introduces a new feature for selecting, moving and resizing areas within the viewer.

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
