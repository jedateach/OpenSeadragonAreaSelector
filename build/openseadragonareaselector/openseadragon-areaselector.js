//! OpenSeadragonAreaSelector 0.1.0
//! Build date: 2015-04-09
//! https://github.com/jedateach/OpenSeadragonAreaSelector
(function( $ ){

$.AreaSelector = function( options ) {

	//TODO: implement proper options setting
	this.options = options || {};

    if (!options.viewer) {
        throw new Error('A viewer must be specified.');
    }
	this.viewer = options.viewer;

	this.element = _createAreaSelectorElement();

	_createResizeHandles(this);

	//TODO: allow setting start size
	this.rect = new $.Rect(0.45, 0.45, 0.1, 0.1);

	this.viewer.addOverlay(
		this.element,
		this.rect,
		$.OverlayPlacement.CENTER
	);

	this.mouseTracker = new $.MouseTracker({
		element: this.element,
		pressHandler: $.delegate(this, this.pressHandler),
		dragHandler: $.delegate(this, this.dragHandler),
		dragEndHandler: $.delegate(this, this.dragEndHandler)
	});

	this.gridSize = 0.1;

	this.boundary = this.options.boundary || this.viewer.viewport.getBounds();
};

$.AreaSelector.prototype = {

	pressHandler: function(event) {
		this.dragStartOffset = this.viewer.viewport.deltaPointsFromPixels(event.position);
	},

	dragHandler: function(event) {
		var dragPos = this.viewer.viewport.pointFromPixel(
			new $.Point(event.originalEvent.x,event.originalEvent.y)
		);

		this.rect.x = dragPos.x - this.dragStartOffset.x;
		this.rect.y = dragPos.y - this.dragStartOffset.y;

		this.respectBoundary();

		//this.snapToGrid();

		//update position
		this.viewer.updateOverlay(
			this.element,
			this.rect,
			$.OverlayPlacement.TOP_LEFT
		);
	},

	dragEndHandler: function() {
		//enable zooming and other viewer controls?
	},

	snapToGrid: function() {
		//TODO: allow custom grid width/height
		this.rect.x = Math.floor(this.rect.x * 10) / 10;
		this.rect.y = Math.floor(this.rect.y * 10) / 10;
	},

	/**
	 * Constrains the area selector to the boundary defined in options.
	 */
	respectBoundary: function() {
		if(!this.boundary){
			return;
		}
		var b = this.boundary;
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
	}

};

/**
 * Create area selector dom element
 */
function _createAreaSelectorElement(){
	var el = document.createElement("div");
	el.className = "openseadragon-areaselector";

	el.style.cursor = "move";
	el.style.position = "relative";

	//TODO: allow customising style
	el.style.border = "2px dashed #2CFC0E";

	return el;
}

/**
 * Create resize handles
 * Attach, and position accordingly, relative to area selector.
 */
function _createResizeHandles(areaselector) {

	areaselector.handles = areaselector.heandles || {};

	var offset = "-7px";
	var size = "10px";

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
		el.style.backgroundColor = "#2CFC0E";
		el.style.borderRadius = "50%";
		
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
