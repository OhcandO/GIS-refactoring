/**
 * GisApp.reset
 * @requires gis.core.js
 */
GisApp.reset = function(options) {
	this.initialize(options);
};

GisApp.reset.prototype = {
	instance: null,
	targetElement: null,
	initialize: function(options) {
		GisApp.Module.reset = this;
	},
	clear: function(array, level) {
		if(GisApp.Module.select){
			GisApp.Module.select.reset();
		}
		GisApp.Module.core.deleteLayer(GisApp.hLayerId);
		GisApp.Module.core.deleteLayer(GisApp.hlLayerId);
		$("#editStart").addClass("active");
		$("#editStart").trigger("click");
	},
}