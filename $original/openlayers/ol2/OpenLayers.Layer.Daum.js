/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Layer/XYZ.js
 */
//일반
OpenLayers.Layer.DaumBaseMap = OpenLayers.Class(OpenLayers.Layer.XYZ, {
    name: "DaumBaseMap",
    url: [
		"http://map3.daumcdn.net/map_2d/1780jc1/L${z}/${y}/${x}.png"
    ],
	resolutions: [64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
	sphericalMercator: false,
	transitionEffect: "resize",
	buffer: 1,
	numZoomLevels: 9,
	minResolution: 0.25,
	maxResolution: 64,
	units: "m",
	projection: new OpenLayers.Projection("EPSG:5181"),
	displayOutsideMaxExtent: false,
	maxExtent: new OpenLayers.Bounds(-30000, -60000, 494288, 988576),
    initialize: function(name, options) {
		if (!options) options = {resolutions: [64, 32, 16, 8, 4, 2, 1, 0.5, 0.25]};
		else if (!options.resolutions) options.resolutions = [64, 32, 16, 8, 4, 2, 1, 0.5, 0.25];
        var newArgs = [name, null, options];
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this, newArgs);
    },
    clone: function(obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.DaumBaseMap(
                this.name, this.getOptions());
        }
        obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
        return obj;
    },
	getXYZ: function(bounds) {
        var res = this.getServerResolution();
        var x = Math.round((bounds.left - this.maxExtent.left) /
            (res * this.tileSize.w));
        var y = Math.round((bounds.bottom - this.maxExtent.bottom) /
            (res * this.tileSize.h));
        var z = 9 - this.getServerZoom();

        if (this.wrapDateLine) {
            var limit = Math.pow(2, z);
            x = ((x % limit) + limit) % limit;
        }

        return {'x': x, 'y': y, 'z': z};
    },
	
    CLASS_NAME: "OpenLayers.Layer.DaumBaseMap"
});

//항공
OpenLayers.Layer.DaumSkyMap = OpenLayers.Class(OpenLayers.Layer.XYZ, {

    name: "DaumSkyMap",
    url: [
          //http://map3.daumcdn.net/map_2d/1780jc1/L3/1958/907.png //일반
          //http://map2.daumcdn.net/map_skyview/L3/2041/918.jpg?v=160114 //항공
          //http://map0.daumcdn.net/map_skyview/L4/1021/456.jpg?v=160114 //항공
          //http://map1.daumcdn.net/map_skyview/L6/258/113.jpg?v=160114 //항공
          //http://map3.daumcdn.net/map_skyview/L6/258/111.jpg?v=160114 //항공
          //http://map1.daumcdn.net/map_skyview/L5/495/229.jpg?v=160114 //항공
          //http://map3.daumcdn.net/map_hybrid/1780jc1/L3/1958/907.png //하이브리드
		"http://map0.daumcdn.net/map_skyview/L${z}/${y}/${x}.jpg",
		"http://map1.daumcdn.net/map_skyview/L${z}/${y}/${x}.jpg",
		"http://map2.daumcdn.net/map_skyview/L${z}/${y}/${x}.jpg",
		"http://map3.daumcdn.net/map_skyview/L${z}/${y}/${x}.jpg"
//		"http://i1.maps.daum-img.net/map/image/G03/i/1.04/L${z}/${y}/${x}.png",
//		"http://i2.maps.daum-img.net/map/image/G03/i/1.04/L${z}/${y}/${x}.png",
//		"http://i3.maps.daum-img.net/map/image/G03/i/1.04/L${z}/${y}/${x}.png"
    ],
	resolutions: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
//	attribution: '<a target="_blank" href="http://map.daum.net/" '
//		+ 'style="float: left; width: 38px; height: 17px; cursor: pointer; background-image: url(http://i1.daumcdn.net/localimg/localimages/07/2008/map/n_local_img_03_b.png); background-repeat: no-repeat no-repeat; " '
//		+ 'title="Daum 지도로 보시려면 클릭하세요."></a>' 
//		+ 'ⓒ 2017 Daum',
	sphericalMercator: false,
	transitionEffect: "resize",
	buffer: 1,
	numZoomLevels: 14,
	minResolution: 0.5,
	maxResolution: 2048,
	units: "m",
	//projection: new OpenLayers.Projection("EPSG:5181"),
	displayOutsideMaxExtent: true,
	maxExtent: new OpenLayers.Bounds(-30000, -60000, 494288, 988576),
    initialize: function(name, options) {
		if (!options) options = {resolutions: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25]};
		else if (!options.resolutions) options.resolutions = [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25];
        var newArgs = [name, null, options];
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this, newArgs);
    },
    clone: function(obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.DaumSkyMap(
                this.name, this.getOptions());
        }
        obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
        return obj;
    },

	getXYZ: function(bounds) {
        var res = this.getServerResolution();
        var x = Math.round((bounds.left - this.maxExtent.left) /
            (res * this.tileSize.w));
        var y = Math.round((bounds.bottom - this.maxExtent.bottom) /
            (res * this.tileSize.h));
        var z = 14 - this.getServerZoom();

        if (this.wrapDateLine) {
            var limit = Math.pow(2, z);
            x = ((x % limit) + limit) % limit;
        }

        return {'x': x, 'y': y, 'z': z};
    },
	
    CLASS_NAME: "OpenLayers.Layer.DaumSkyMap"
});

//하이브리드
OpenLayers.Layer.DaumHybridMap = OpenLayers.Class(OpenLayers.Layer.XYZ, {

    name: "DaumHybridMap",
    url: [
          //http://map3.daumcdn.net/map_2d/1780jc1/L3/1958/907.png //일반
          //http://map3.daumcdn.net/map_hybrid/1780jc1/L3/1958/907.png //하이브리드
          //http://map3.daumcdn.net/map_hybrid/1780jc1/L0/15899/7371.png
          //http://map3.daumcdn.net/map_hybrid/1780jc1/L3/1985/919.png
		"http://map3.daumcdn.net/map_hybrid/1780jc1/L${z}/${y}/${x}.png",
//		"http://i1.maps.daum-img.net/map/image/G03/i/1.04/L${z}/${y}/${x}.png",
//		"http://i2.maps.daum-img.net/map/image/G03/i/1.04/L${z}/${y}/${x}.png",
//		"http://i3.maps.daum-img.net/map/image/G03/i/1.04/L${z}/${y}/${x}.png"
    ],
	resolutions: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
//	attribution: '<a target="_blank" href="http://map.daum.net/" '
//		+ 'style="float: left; width: 38px; height: 17px; cursor: pointer; background-image: url(http://i1.daumcdn.net/localimg/localimages/07/2008/map/n_local_img_03_b.png); background-repeat: no-repeat no-repeat; " '
//		+ 'title="Daum 지도로 보시려면 클릭하세요."></a>' 
//		+ 'ⓒ 2017 Daum',
	sphericalMercator: false,
	transitionEffect: "resize",
	buffer: 1,
	numZoomLevels: 14,
	minResolution: 0.5,
	maxResolution: 2048,
	units: "m",
	//projection: new OpenLayers.Projection("EPSG:5181"),
	displayOutsideMaxExtent: true,
	maxExtent: new OpenLayers.Bounds(-30000, -60000, 494288, 988576),
    initialize: function(name, options) {
		if (!options) options = {resolutions: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25]};
		else if (!options.resolutions) options.resolutions = [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25];
        var newArgs = [name, null, options];
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this, newArgs);
    },
    clone: function(obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.DaumHybridMap(
                this.name, this.getOptions());
        }
        obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
        return obj;
    },

	getXYZ: function(bounds) {
        var res = this.getServerResolution();
        var x = Math.round((bounds.left - this.maxExtent.left) /
            (res * this.tileSize.w));
        var y = Math.round((bounds.bottom - this.maxExtent.bottom) /
            (res * this.tileSize.h));
        var z = 14 - this.getServerZoom();

        if (this.wrapDateLine) {
            var limit = Math.pow(2, z);
            x = ((x % limit) + limit) % limit;
        }

        return {'x': x, 'y': y, 'z': z};
    },
    
    CLASS_NAME: "OpenLayers.Layer.DaumHybridMap"
});
