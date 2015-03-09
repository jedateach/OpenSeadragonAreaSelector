# OpenSeaDragonAreaSelector (Work in Progress)

This OpenSeaDragon plugin introduces a new feature for selecting, moving and resizing areas within the viewer.


## Feature / Architecture Planning

This plugin should provide equivelant functionality to jQuery UI's `draggable` and `resizeable` interactions. It may even be worth considering using jQuery UI to do the heavy lifting.


### MVP Features

 * Create + attach an area selector to a viewer.
 * Init location + size
 * Click/press and drag to move the area selector.
 * Click/press and drag corners / edges to resize.
 * Constrain position+size to the maximum bounds of image, or possibly a user-defined area.
 

### Backlog

Most of these ideas are from jQuery UI:

 * Snap to grid
 * Event handling: provide hooks to do things. 
 * Enabled / disable specific options
 * Cursor style
 * Auto scroll: pan the viewer as the selector overlaps the edge of the viewer.
 * Rotation
 * Visual feedback

 * Animate resizing
 * Resize helper: Display only an outline of the element while resizing