"use strict";

+(function( $ ){

	var vieweroptions = {
		id: "osdcontainer",
		prefixUrl: "../../lib/openseadragon/build/openseadragon/images/",
		tileSources: [
			"../../../dzi_images/earth.dzi"
		],
		showSequenceControl: true,
	};

	var viewer = $(vieweroptions);

	//Activate area selector
	viewer.activateAreaSelector();

}(OpenSeadragon));
