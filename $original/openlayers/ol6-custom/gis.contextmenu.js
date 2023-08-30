/**
 * GisApp.contextmenu
 * @requires 
 * ol-contextmenu.js
 */
GisApp.contextmenu = function(options) {
	this.initialize(options);
};

GisApp.contextmenu.prototype = {
	defaults: {
		width: 170,
		defaultItems: false,
		hitTolerance: 10
	},
	menu: {},
	items: [],
	initialize: function(options) {
		$.extend(this.defaults, options);
		this.menu = new ContextMenu({
			width: this.width,
			defaultItems: this.defaultItems
		});
		GisApp.Module.core.map.addControl(this.menu);
		this.beforeopen();
	},
	beforeopen: function() {
		this.menu.on('beforeopen', function(evt) {
			let feature, layer;
			let isEnable = false;
			GisApp.Module.core.map.forEachFeatureAtPixel(evt.pixel, function(ft, l) {
				feature = ft;
				layer = l;
			}, { hitTolerance: this.defaults.hitTolerance });

			this.menu.clear();
			this.menu.disable();

			this.items.forEach((item) => {

				if (item.data == null || item.data.enableTypeNames == null || item.data.enableTypeNames.length == 0) {
					return;
				}

				item.data.enableTypeNames.forEach((typeName) => {
					if (layer.get("typeName") == typeName) {
						item.data.feature = feature;
						this.menu.push(item);
						isEnable = true;
					}
				});
			});

			if (isEnable) {
				this.menu.enable();
			}
		}.bind(this));
	},
	setItems: function(items) {
		this.items = items;
	}
}



