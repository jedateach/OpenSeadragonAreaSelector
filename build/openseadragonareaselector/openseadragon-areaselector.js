//! OpenSeadragonAreaSelector 0.1.0
//! Build date: 2015-04-03
//! https://github.com/jedateach/OpenSeadragonAreaSelector
(function( $ ){

$.AreaSelector = function( options ) {

	this.options = options || {};

    if (!options.viewer) {
        throw new Error('A viewer must be specified.');
    }
	this.viewer = options.viewer;

	this.element = _createAreaSelectorElement();

	_createResizeHandles(this);

	this.rect = new $.Rect(0.5, 0.5, 0.1, 0.1);

	this.viewer.addOverlay(
		this.element,
		this.rect,
		$.OverlayPlacement.CENTER
	);

	this.mouseTracker = new $.MouseTracker({
		element: this.element,
		pressHandler: $.delegate(this, this.pressHandler),
		releaseHandler: $.delegate(this, this.releaseHandler),
		dragHandler: $.delegate(this, this.dragHandler)
	});

	this.gridSize = 0.1;

};

$.AreaSelector.prototype = {

	pressHandler: function(event) {
		this.dragging = true;

		this.dragOrigin = event.position.clone();
		this.rectOrigin = this.rect.getTopLeft();
	},

	dragHandler: function(event) {
		var offset = event.position.minus(this.dragOrigin);
		offset = this.viewer.viewport.deltaPointsFromPixels(offset);

		this.rect.x = this.rectOrigin.x + offset.x;
		this.rect.y = this.rectOrigin.y + offset.y;

		//this.snapToGrid();

		//TODO: this.respectViewport();

		//update position
		this.viewer.updateOverlay(
			this.element,
			this.rect,
			$.OverlayPlacement.CENTER
		);
	},

	releaseHandler: function() {
		this.dragging = false;
		//enable zooming and other viewer controls?
	},

	snapToGrid: function() {
		//TODO: allow custom grid width/height
		this.rect.x = Math.floor(this.rect.x * 10) / 10;
		this.rect.y = Math.floor(this.rect.y * 10) / 10;
	}

};

/**
 * Create area selector dom element
 */
function _createAreaSelectorElement(){
	var el = document.createElement("div");
	el.className = "openseadragon-areaselector";

	el.style.borderWidth = "2px";
	el.style.borderStyle = "dashed";
	el.style.borderColor = "red";
	el.style.cursor = "move";
	el.style.position = "relative";

	return el;
}

/**
 * Create resize handles
 * Attach, and position accordingly, relative to area selector.
 */
function _createResizeHandles(areaselector) {

	areaselector.handles = areaselector.heandles || {};

	//handle locations and sizes
	var hlocs = {
		"n": {w:"100%", h:"10px", t:"-2px", l:"-2px", c:"ns"},
		"e": {w:"10px", h:"100%", t:"-2px", r:"-2px", c:"ew"},
		"s": {w:"100%", h:"10px", b:"-2px", l:"-2px", c:"ns"},
		"w": {w:"10px", h:"100%", t:"-2px", l:"-2px", c:"ew"},
		"se": {w:"10px", h:"10px", b:"-2px", r:"-2px", c:"nwse"},
		"sw": {w:"10px", h:"10px", b:"-2px", l:"-2px", c:"nesw"},
		"ne": {w:"10px", h:"10px", t:"-2px", r:"-2px", c:"nesw"},
		"nw": {w:"10px", h:"10px", t:"-2px", l:"-2px", c:"nwse"}
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

		//visual style
		el.style.backgroundColor = "white";
		el.style.border = "1px solid grey";
		
		areaselector.element.appendChild(el);
	}
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
