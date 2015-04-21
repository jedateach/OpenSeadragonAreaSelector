(function( $ ){

$.AreaSelector = function( options ) {
	var self = this;
    if (!options.viewer) {
        throw new Error('A viewer must be specified.');
    }

    //apply options to this
	$.extend( true, this, {
		//rect representing size/location of selector
		rect: new $.Rect(0.45, 0.45, 0.1, 0.1),
		boundary: options.viewer.viewport.getBounds(),
		handleOffset: 10, //px
		handleSize: 15, //px
		grid: null, //logical
		borderWidth: 1,
		visible: true,
		zIndex: 100
	}, options );

    //Inherit some behaviors and properties
    $.EventSource.call( this );

	this.gridX = this.gridX || this.grid;
	this.gridY = this.gridY || this.grid;
	this.element = this.makeSelectorElement();
	this.handles = this.makeResizeHandles();

	//function to offset by border width
	var draw = function(position, size, element ){
		var style = this.style;
		var border = self.borderWidth;
		//offset position by border
		style.left     = position.x - border + "px";
        style.top      = position.y - border + "px";
        style.position = "absolute";
        style.display  = self.visible ? 'block' : 'none';
        style.zIndex = ""+self.zIndex;
        if ( this.scales ) {
            style.width  = size.x + "px";
            style.height = size.y + "px";
        }
	};

	//add overlay to viewer
	this.viewer.addOverlay(
		this.element,
		this.rect,
		$.OverlayPlacement.CENTER,
		draw		
	);
	//event handling
	this.viewer.addHandler('canvas-press', $.delegate(this, this.pressHandler));
	this.viewer.addHandler('canvas-drag', $.delegate(this, this.dragHandler));
	this.viewer.addHandler('canvas-drag-end', $.delegate(this, this.dragEndHandler));
};

$.extend( $.AreaSelector.prototype, $.EventSource.prototype, {

	/**
	 * Show the selector
	 */
	show: function() {
		this.visible = true;
		this.redraw();
	},

	/**
	 * Hide the selector
	 */
	hide: function() {
		this.visible = false;
		this.redraw();
	},

	/**
	 * Create area selector DOM element
	 */
	makeSelectorElement: function() {
		var el = document.createElement("div");
		el.className = "openseadragon-areaselector";
		el.style.cursor = "move";
		el.style.borderWidth = this.borderWidth+"px";
		el.style.borderStyle = "dashed";

		return el;
	},

	/**
	 * Create resize handles
	 * Attach, and position accordingly, relative to area selector.
	 */
	makeResizeHandles: function() {
		var handles = {},
			offset = "-"+this.handleOffset+"px",
			size = this.handleSize+"px";
		//handle locations and sizes
		var hlocs = {
			"n": {w:size, h:size, t:offset, l:"50%", c:"ns"},
			"e": {w:size, h:size, t:"50%", r:offset, c:"ew"},
			"s": {w:size, h:size, b:offset, r:"50%", c:"ns"},
			"w": {w:size, h:size, b:"50%", l:offset, c:"ew"},
			"se": {w:size, h:size, b:offset, r:offset, c:"nwse"},
			"sw": {w:size, h:size, b:offset, l:offset, c:"nesw"},
			"ne": {w:size, h:size, t:offset, r:offset, c:"nesw"},
			"nw": {w:size, h:size, t:offset, l:offset, c:"nwse"}
		};
		for(var l in hlocs){
			var el = document.createElement("div");
			var cname = l+"-resize";
			el.className = "openseadragon-areaselector-handle handle-"+cname;
			el.style.position = "absolute";
			el.style.width = hlocs[l].w;
			el.style.height = hlocs[l].h;
			if(hlocs[l].t !== undefined) {
				el.style.top = hlocs[l].t;
			}
			if(hlocs[l].b !== undefined) {
				el.style.bottom = hlocs[l].b;
			}
			if(hlocs[l].l !== undefined) {
				el.style.left = hlocs[l].l;
			}
			if(hlocs[l].r !== undefined) {
				el.style.right = hlocs[l].r;
			}
			el.style.cursor = hlocs[l].c+"-resize";

			//TODO: allow customising style
			el.style.backgroundColor = "#FFF";
			el.style.borderRadius = "50%";
			el.style.borderWidth = "1px";
			el.style.borderStyle = "solid";
			
			handles[l] = {
				element: el,
				dir: l
			};

			this.element.appendChild(el);
		}

		return handles;
	},

	/**
	 * Handle cavnvas mousedown event
	 */
	pressHandler: function(event) {
		if(this.dragging || this.resizing) return;

		this.dragStart = this.viewer.viewport.pointFromPixel(event.position);
		//look for clicked handle
		var handle;
		for(var h in this.handles){
			if(event.originalEvent.target === this.handles[h].element){
				handle = this.handles[h];
			}
		}
		if(handle){
			this.resizing = true;
			this.currentHandle = handle;
			this.dragRectStart = this.dragStart.minus(this.rect.getTopLeft());
			this.rectStart = this.rect.clone();
			this.disableViewerPan();
		}else if(_insideRect(this.dragStart, this.rect)){
			this.dragging = true;
			this.dragStart = this.viewer.viewport.pointFromPixel(event.position);
			this.dragRectStart = this.dragStart.minus(this.rect.getTopLeft());
			this.disableViewerPan();
		}
	},

	/**
	 * Update postion / size, based on current dragging
	 * of mouse.
	 */
	dragHandler: function(event) {
		if(!this.dragging && !this.resizing) return;
			
		var dragPos = this.viewer.viewport.pointFromPixel(
			new $.Point(event.position.x,event.position.y)
		);
		if(this.resizing){
			var delta = dragPos.minus(this.dragStart),
				trigger = this._change[this.currentHandle.dir],
				data = trigger.apply(this,[event, delta.x, delta.y]);
			for(var d in data){
				this.rect[d] = data[d];
			}
		}else if(this.dragging){
			this.rect.x = dragPos.x - this.dragRectStart.x;
			this.rect.y = dragPos.y - this.dragRectStart.y;
		}
		this.snapToGrid();
		this.respectBoundary();
		
		this.redraw();
	},

	/**
	 * End dragging / resizing
	 */
	dragEndHandler: function() {
		if(!this.dragging && !this.resizing) return;
		if(this.resizing){
			this.currentHandle = null;
			this.resizing = false;
		}else if(this.dragging){
			this.dragging = false;
		}
		this.enableViewerPan();
	},

	/**
	 * Redraw the overlay element
	 */
	redraw: function() {
		//TODO: only redraw if location or size are different
		this.viewer.updateOverlay(
			this.element,
			this.rect,
			$.OverlayPlacement.TOP_LEFT
		);
		this.raiseEvent( 'redraw');
	},

	/**
	 * Move the selector to the given rect location
	 * @param OpenSeadragon.Rect rect
	 */
	setLocation: function(rect) {
		this.rect = rect;
		this.redraw();
	},

	/**
	 * Snap the area selector to a given grid
	 */
	snapToGrid: function() {
		if(this.gridX){
			var gridX = 1/this.gridX;
			this.rect.x = Math.floor(this.rect.x * gridX) / gridX;
			this.rect.width = Math.floor(this.rect.width * gridX) / gridX;
			if(this.rect.width < this.gridX){
				this.rect.width = this.gridX;
			}
		}
		if(this.gridY){
			var gridY = 1/this.gridY;
			this.rect.y = Math.floor(this.rect.y * gridY) / gridY;
			this.rect.height = Math.floor(this.rect.height * gridY) / gridY;
			if(this.rect.height < this.gridY){
				this.rect.height = this.gridY;
			}
		}
	},

	/**
	 * Constrain the area selector to the boundary defined in options.
	 */
	respectBoundary: function() {
		if(!this.boundary){
			return;
		}
		var b = this.boundary;
		//constrain size
		if(this.rect.width > b.width){
			this.rect.width = b.width;
		}
		if(this.rect.height > b.height){
			this.rect.height = b.height;
		}
		//constrain position
		if(this.rect.x < b.x){
			this.rect.x = b.x;
		}else if(this.rect.x + this.rect.width > b.x + b.width){
			this.rect.x = b.x + b.width - this.rect.width;
		}
		if(this.rect.y < b.y){
			this.rect.y = b.y;
		}else if(this.rect.y + this.rect.height > b.y + b.height){
			this.rect.y = b.y + b.height - this.rect.height;
		}
	},

	/**
	 * Disable some elements of the viewer
	 */
	disableViewerPan: function() {
		this.panVerticalOriginal = this.viewer.panVertical;
		this.panHorizontalOriginal = this.viewer.panHorizontal;
		this.flickOriginal = this.viewer.gestureSettingsTouch.flickEnabled
		this.viewer.panVertical = false;
		this.viewer.panHorizontal = false;
		this.viewer.gestureSettingsTouch.flickEnabled = false;
	},

	/**
	 * Re-enable previously disabled elements.
	 */
	enableViewerPan: function() {
		this.viewer.panVertical = this.panVerticalOriginal;
		this.viewer.panHorizontal = this.panHorizontalOriginal;
		this.viewer.gestureSettingsTouch.flickEnabled = this.flickOriginal;
	},
	
	/**
	 * Collection of functions for appropriately updating
	 * size/position, based on current handle
	 * borrowed from jqueryUI resizable.js
	 */
	_change: {
		e: function(event, dx) {
			return { width: this.rectStart.width + dx };
		},
		w: function(event, dx) {
			var rs = this.rectStart;
			return { x: rs.x + dx, width: rs.width - dx };
		},
		n: function(event, dx, dy) {
			var rs = this.rectStart;
			return { y: rs.y + dy, height: rs.height - dy };
		},
		s: function(event, dx, dy) {
			return { height: this.rectStart.height + dy };
		},
		se: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments),
				this._change.e.apply(this, [ event, dx, dy ]));
		},
		sw: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments),
				this._change.w.apply(this, [ event, dx, dy ]));
		},
		ne: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments),
				this._change.e.apply(this, [ event, dx, dy ]));
		},
		nw: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments),
				this._change.w.apply(this, [ event, dx, dy ]));
		}
	}

});

/**
* Is a point inside a rectangle
*/
function _insideRect(point, rect) {
  return (point.x >= rect.x && point.x < rect.x + rect.width &&
		point.y >= rect.y && point.y < rect.y + rect.height);
}

/**
 * Creates a new AreaSelector attached to the viewer.
 **/
$.Viewer.prototype.activateAreaSelector = function(options) {
	if (!this.areaSelector) {
		options = options || {};
		options.viewer = this;
		this.areaSelector = new $.AreaSelector(options);
	}

	return this.areaSelector;
};

}( OpenSeadragon ));
