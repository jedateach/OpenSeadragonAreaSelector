"use strict";

+(function( $ ){

	var vieweroptions = {
		id: "osdcontainer",
		prefixUrl: "../../lib/openseadragon/build/openseadragon/images/",
		tileSources: [
			//"https://openseadragon.github.io/example-images/duomo/duomo.dzi"
			"https://openseadragon.github.io/example-images/highsmith/highsmith.dzi"
		],
		showSequenceControl: true,
	};

	var viewer = $(vieweroptions);

	viewer.addHandler('open', function (event) {
		var tileSource = viewer.world.getItemAt(0);
		var boundary = new $.Rect(0,0,1,1);
		if(tileSource.normHeight){
			boundary.height = tileSource.normHeight;
		}else if(tileSource.normWidth){
			boundary.width = tileSource.normWidth;
		}
		//Activate area selector
		viewer.activateAreaSelector({
			boundary: boundary
		});
	});

}(OpenSeadragon));
