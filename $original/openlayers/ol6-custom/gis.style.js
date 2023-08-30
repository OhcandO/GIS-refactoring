/**
 * GisApp.style
 * @requires 
 */
GisApp.style = function() {
	this.initialize();
};

GisApp.style.prototype = {
	initialize: function() {
		this.layericonPath = GisApp.CONTEXT_PATH + 'images/layericon/';
	},
	getRGBAToString: function(r, g, b, a) {
		let rgba = "rgba({r}, {g}, {b}, {a})";
		return rgba.replace("{r}", r).replace("{g}", g).replace("{b}", b).replace("{a}", a);
	},
	getLineColor: function(layer) {
		let r = layer.get("linecolorr");
		let g = layer.get("linecolorg");
		let b = layer.get("linecolorb");
		let a = layer.get("linecolora");
		return this.getRGBAToString(r, g, b, a);
	},
	getFillColor: function(layer) {
		let r = layer.get("fillcolorr");
		let g = layer.get("fillcolorg");
		let b = layer.get("fillcolorb");
		let a = layer.get("fillcolora");
		return this.getRGBAToString(r, g, b, a);
	},
	getFontLineColor: function(layer) {
		let r = layer.get("fontlinecolorr");
		let g = layer.get("fontlinecolorg");
		let b = layer.get("fontlinecolorb");
		let a = layer.get("fontlinecolora");
		return this.getRGBAToString(r, g, b, a);
	},
	getFontFillColor: function(layer) {
		let r = layer.get("fontfillcolorr");
		let g = layer.get("fontfillcolorg");
		let b = layer.get("fontfillcolorb");
		let a = layer.get("fontfillcolora");
		return this.getRGBAToString(r, g, b, a);
	},
	point: function(layer, options, feature, resolution) {
		
		/* <CM_LAYER2> 테이블에서, point 속성을 보임 */
		let fillColor = this.getFillColor(layer);
		
		
		let lineColor = this.getLineColor(layer);
		let pointSize = layer.get("linewidth");
		
		let symbol = layer.get("symbol");
		let textBaseline = layer.get("textBaseline") || "bottom";
		let textAlign = layer.get("textAlign") || "end";
		let image;
		let style = new ol.style.Style({
//			text: new ol.style.Text({ textBaseline: textBaseline, textAlign: textAlign }),
//			fill: new ol.style.Fill()
		});

		//아이콘 그림이 기본 90도 회전한 상태이고, 방향각은 북쪽을 기준으로 하므로 90도 보정을 해 줌
		// 데이터는 360도 기반 각도 표현이고, Openlayers 에서 회전각 단위는 rad 이므로 변환해줌
		// 그러나, 애초에 밸브 방향각이 정확하게 등록되지 않아 제멋대로인 상황임 (2022-05-04)
		/*
		if(layer.get('typeName')==='WTL_VALV_PS'){
			rotation = (feature.get('ANG_DIR')-90) * (Math.PI) / 180;	
		}
		*/

		if (symbol) {
			image = new ol.style.Icon({
				crossOrigin: 'anonymous',
//				imgSize: [20, 20],
				src: this.layericonPath + symbol,
				scale: 1.2
			});
		} else if(options.searchSize){
			image = new ol.style.Circle({
				radius:~~options.searchSize+5||10.0,
				fill: new ol.style.Fill({
					color: options.searchColor || '#0000FF',
				}),
			});
		} 
		else {
			image = new ol.style.Circle({
				fill: new ol.style.Fill({
//						color: "#4848B4"
					color: fillColor
				}),
				//	radius: 1.0
				radius: ~~pointSize,
				stroke: new ol.style.Stroke({
					color: lineColor,
					width: 1,
//					lineDash: lineDash,
				}),
			});
		}
		
		let text = this.getText(layer, feature, resolution,options);
		style.setText(text);
		
		style.setImage(image);
//		$.extend(style, options);
		return style;
	},
	line: function(layer, options, feature, resolution) {
		let linewidth = layer.get("linewidth");
		let lineColor = this.getLineColor(layer);
		
		let lineDash = null; //null 또는 숫자 인수인 배열
		if(layer.get("linestyle")&&layer.get("linestyle").toLowerCase()!='solid'){
			lineDash = JSON.parse(layer.get("linestyle")); //[3,5] 
		}

		let tempStroke = new ol.style.Stroke({
				color: lineColor,
				width: linewidth,
				lineDash: lineDash,
			});
		
		if(options.searchSize){
			tempStroke = new ol.style.Stroke({
				color: options.searchColor || '#0000FF',
				width:~~options.searchSize||5.0,
			});
		}
		
		let style = new ol.style.Style({
			stroke: tempStroke,
			text: new ol.style.Text()
		});

		if (GisApp.Module.toolbar && GisApp.Module.toolbar.defaults.blockDiagramVisible) {
			let blockDiagramLayerId = GisApp.Module.toolbar.getBlockDiagramLayerId(layer.get("id"));
			if (blockDiagramLayerId) {
				style = this.getArrowStyle(feature, lineColor, linewidth);
			}
		}
		return style;
	},
	poligon: function(layer, options, feature, resolution) {
		let style = new ol.style.Style();
		let fill = new ol.style.Fill({
			color: this.getFillColor(layer)
		});
		style.setFill(fill);
//		$.extend(style, options);
		return style;
	},
	lineLabelPoligon: function(layer, options, feature, resolution) {
		let style = new ol.style.Style();
		let fill = new ol.style.Fill({
			color: this.getFillColor(layer)
		});
		
		let linewidth = layer.get("linewidth");
		let lineColor = this.getLineColor(layer);
		let lineDash = null; //null 또는 숫자 인수인 배열
		if(layer.get("linestyle")&&layer.get("linestyle").toLowerCase()!='solid'){
			lineDash = JSON.parse(layer.get("linestyle")); //[3,5] 
		}
		
		let tempStroke = new ol.style.Stroke({
				color: lineColor,
				width: linewidth,
				lineDash: lineDash,
			});
		
		if(options.searchSize){
			tempStroke = new ol.style.Stroke({
				color: options.searchColor || '#0000FF',
				width:~~options.searchSize||5.0,
			});
		}
		
		let text = this.getText(layer, feature, resolution,options);
		style.setFill(fill);
		style.setText(text);
		style.setStroke(tempStroke);
//		$.extend(style, options);
		return style;
	},
	imagePoligon: function(layer, options, feature, resolution) {
	if (feature.getGeometry() instanceof ol.geom.Polygon || feature.getGeometry() instanceof ol.geom.MultiPolygon) {
		let tempStyle = new ol.style.Style();
		let symbol = layer.get("symbol");
		let geom = feature.getGeometry();
		let pointGeom = geom instanceof ol.geom.Polygon ? geom.getInteriorPoint() : geom.getInteriorPoints();

		let tempSymbol = new ol.style.Icon({
			crossOrigin: 'anonymous',
			anchor: [0.5, 0.5],
			scale: 1.2,
			src: this.layericonPath + symbol
		});
		
		if (options.searchSize) {
			tempSymbol = new ol.style.Circle({
				radius: ~~options.searchSize || 5.0,
				fill: new ol.style.Fill({
					color: options.searchColor || '#0000FF',
				}),
			});
		}
		tempStyle.setGeometry(pointGeom);
		tempStyle.setImage(tempSymbol);

//		$.extend(tempStyle, options);
		return tempStyle;
		}else{return null;}
	},
	label: function(layer, options, feature, resolution) {
		let textBaseline = layer.get("textBaseline") || "bottom";
		let textAlign = layer.get("textAlign") || "center";
		let fontLineWidth = Number(layer.get("fontlinewidth") || "6");
		let style = new ol.style.Style();
		let prop = feature.getProperties();
		let label = prop[layer.get("labelColumn")];
		
		let text = new ol.style.Text({
			stroke: new ol.style.Stroke({
				color: this.getFontLineColor(layer),
				width: fontLineWidth
			}),
			fill: new ol.style.Fill({
				color: this.getFontFillColor(layer),
			}),
			font: layer.get("font"),
			textBaseline: textBaseline,
			textAlign: textAlign,
			text: label
		});
		style.setStroke(null);
		style.setFill(null);
		style.setText(text);
//		$.extend(style, options);

		return style;
	},
	getText: function(layer, feature, resolution, option) { //resolution 은 지면에 가까워질수록 작아진다 zoom13.5=res13.5, zoom17.2=res1.0
		let textBaseline = layer.get("textBaseline") || "middle";
		let textAlign = layer.get("textAlign") || "center";
		let fontLineWidth = Number(layer.get("fontlinewidth") || "6");
		let prop = feature.getProperties();
//		let label = prop[layer.get("labelColumn")];
//			if(label){
//			var tmp = ""+prop[layer.get("labelColumn")];
//				tmp.toString();
//				label=tmp;
//			}
		let tempLabel = prop[layer.get("labelColumn")];

		let label = tempLabel ? tempLabel.toString() : ' ';

		let fontFill = new ol.style.Fill({
			color: this.getFontFillColor(layer),
		});
		let fontCss = layer.get('font');
		let fontStrokeColor = this.getFontLineColor(layer);
		if (option.searchFont) {
			fontFill = new ol.style.Fill({color: option.searchFontColor,});
			fontCss = option.searchFont;
			fontStrokeColor = option.searchFontStrokeColor;
		}
		
		let text = new ol.style.Text({
			stroke: new ol.style.Stroke({
				color: fontStrokeColor,
				width: fontLineWidth
			}),
			fill: fontFill,
			font: fontCss,
			textBaseline: textBaseline,
			offsetX:15,
			offsetY:6,
			textAlign: textAlign,
			overflow:true,	//라벨이 feature의 크기보다 커져도 보이게 함
			text: label,
		});

		return text;
	},
	getArrowStyle: function(feature, lineColor, linewidth) {
		let styles = [
			new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: lineColor,
					width: linewidth
				})
			})
		];
		let geomLienString = GisApp.Module.core.getGeomLineOfFeature(feature);
		if (geomLienString) {
			let startCoord = geomLienString.getFirstCoordinate();
			let endCoord = geomLienString.getLastCoordinate();

			let dx = endCoord[0] - startCoord[0];
			let dy = endCoord[1] - startCoord[1];
			let rotation = Math.atan2(dy, dx);

			let centerCoord = GisApp.Module.core.getCenterOfLineFeature(feature);
			styles.push(new ol.style.Style({
				geometry: new ol.geom.Point(centerCoord),
				image: new ol.style.RegularShape({
					fill: new ol.style.Fill({ color: lineColor }),
					points: 3,
					radius: 6,
					rotation: -rotation,
					angle: Math.PI / 2
				})
			}));
		}
		return styles;
	},
	//레이어 스타일 반환
	getLayerStyle: function(layer, options) {
		let defStyle = layer.get("defStyle");
		let style = this[defStyle](layer, options);
		return style;
	},
	getLayerStyleFunction: function(layer, options) {
		let defStyle = layer.get("defStyle");
		let styleFunction = function(feature, resolution) {
			return this[defStyle](layer, options, feature, resolution);
		}.bind(this);
		return styleFunction;
	},
	setFeatureBuffer: function(feature) {
		let jstsGeom = parser.read(feature.getGeometry());
		let buffered = jstsGeom.buffer(10);
		feature.setGeometry(parser.write(buffered));
	}
}

