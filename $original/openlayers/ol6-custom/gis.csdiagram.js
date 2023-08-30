/**
 * GisApp.csdiagram
 */
GisApp.csdiagram = function(options) {
	this.initialize(options);
};

GisApp.csdiagram.prototype = {
	defaults: {
	},
	dragPolygon : null,
	polygonLayer : null,
	selectedFeatures : [],
	initialize: function(options) {
		$.extend(this.defaults, options);
		this.crossSectionEventListener();
	},
	crossSectionEventListener: function() {
		let me = this;
		
		$("#chart-form").dialog({
			autoOpen: false,
		  	modal: false,
		  	width: 680,
		  	height: 505,
		  	autoResize : true,
		  	resizable: false,
		  	position: { 
		  		my: "center center", 
		  		at: "center+180 center+90"   
		  	},
		  	open: function() {
		    },
		    close: function(){
		    }
		});
		
		$("#crossSectionDiagram").on('click', function(){
			if($('.choice_danmyun').css('display') == 'none'){
				$(".choice_danmyun").show();
				$('#cs_diagram_show').attr("disabled",true); //단면도 생성 버튼은 아직 사용 불가
				$('#cs_diagram_show').css("background","gray");
				$('#cs_diagram_show').css("cursor","default"); 
				$('#editStart').attr("disabled",true);//편집하기 버튼 사용 못하게 하기
				$('#editStart').css("cursor","default");  
				GisApp.Module.core.reset.clear();
				GisApp.Module.select.setActive(false);
			}
		});
		
		//단면도 닫기 버튼 클릭시 이벤트	
		$("#cs_diagram_close").click(function(e){
			e.stopImmediatePropagation();// 현재 이벤트가 상위뿐 아니라 현재 레벨에 걸린 다른 이벤트도 동작하지 않도록 합니다.
			$(".choice_danmyun").hide();
			$('#editStart').attr("disabled",false);
			$('#editStart').css("cursor","pointer");
			GisApp.Module.select.setActive(true);
			let map = GisApp.Module.core.map;
			map.removeLayer(me.polygonLayer);
			map.removeInteraction(me.dragPolygon);
			GisApp.Module.core.reset.clear();
		});
		
		// 영역그리기
		$("#cs_diagram_draw").click(function(){
			$('#cs_diagram_show').attr("disabled",true);
			$('#cs_diagram_show').css("background","gray");
			$('#cs_diagram_show').css("cursor","default");
			me.setPolygonInteration();
		});
		
		// 단면도 생성(보기)
		$("#cs_diagram_show").click(function() {
			
			var pipeCodeList = [];
			var manhCoceList = [];
			
			let layerCodeList = GisApp.layerCode;
			for(let i in layerCodeList){
				let layerCode = layerCodeList[i];
				if(layerCode.isLayer == "Y"){
					if (layerCode.typeName == 'SWL_PIPE_LM'){//하수관로
						if ($("#tree-layer-control").jstree(true).get_node('layerid_' + i).state.selected == true) {
							pipeCodeList.push( layerCode.layerGroup );
						}
					}
					else if (layerCode.typeName == 'SWL_MANH_PS') {
						if ($("#tree-layer-control").jstree(true).get_node('layerid_' + i).state.selected == true) {
							manhCoceList.push( layerCode.layerGroup );
						}
					}
				}
			}
			if (me.polygonLayer != null)
				crossSection(me.polygonLayer, pipeCodeList, manhCoceList);
		});
	},
	/**
	 * 폴리곤 SELECT 이벤트 등록
	 */
	setPolygonInteration: function() {
		let me = this;
		let map = GisApp.Module.core.map;
		if(me.polygonLayer){
			map.removeLayer(me.polygonLayer);
		}
		//폴리곤 레이어 생성
		let polygonSource = new ol.source.Vector({
			useSpatialIndex: false
		});
		this.polygonLayer = new ol.layer.Vector({
			source: polygonSource
		});
		map.addLayer(me.polygonLayer);

		//폴리곤 draw 객체 생성
		me.dragPolygon = new ol.interaction.Draw({
			source: polygonSource,
			type: 'Polygon',
			condition: ol.events.condition.mouseOnly
		});
		map.addInteraction(me.dragPolygon);

		//툴팁 추가
		let helptooltip = new GisApp.helptooltip("시작점을 클릭하세요.");
		helptooltip.createHelpTooltip();

		me.dragPolygon.on('drawstart', function() {
			helptooltip.removeHelpTooltip();
			me.selectedFeatures=[];
		});

		me.dragPolygon.on('drawend', function(evt) {
			setTimeout(function() {
				let polygon = evt.feature.getGeometry();
				let layers = map.getLayers();
				/*for (let i in layers.array_) {
					let layer = layers.array_[i];
					if (layer.get("selectable")) {
						let features = layer.getSource().getFeatures();
						for (let j = 0; j < features.length; j++) {
							if (polygon.intersectsExtent(features[j].getGeometry().getExtent())) {
								me.selectedFeatures.push(features[j]);
							}
						}
					}
				}*/
				map.removeInteraction(me.dragPolygon);
				$('#cs_diagram_show').attr("disabled",false);
				$('#cs_diagram_show').css("background","#ffffff");
				$('#cs_diagram_show').css("cursor","pointer");
			}, 300)
		});
	},
	//단면도 그래프 생성
	drawGraph: function(gr_data) {
		var searchInfo = gr_data.split(",");
		var pipeArray = [];
		var manhArray = [];
		var pipeId = [];
		
		for (var i = 0 ; i < searchInfo.length; i++) {
			
			if (searchInfo[i].indexOf("P") > -1) {
				
				// P|30001|10:1.2;30:1.5
				var resultP = searchInfo[i].substr(searchInfo[i].lastIndexOf("|") + 1, searchInfo[i].length);
				
				pipeId.push(searchInfo[i].split("|"));
				
				var value = resultP.split(";");
				for (var ii = 0 ; ii < value.length; ii++) {
					pipeArray.push( [value[ii].split(":")[0], value[ii].split(":")[1], value[ii].split(":")[2], value[ii].split(":")[3] ]);
				}
			}
			else {
				// M|30012|70|0.9
	            var values = searchInfo[i].split("|");
	            manhArray.push([values[1], Number(values[2]), Number(values[3])]);
			}

		} 
		
		var pipeId_str = [];
		for (var i = 0; i < pipeId.length; i++) {
			pipeId_str.push( pipeId[i][1] );
		}
		
		var chart = new Highcharts.chart('divGraph', {
			
		    xAxis: {
		        min: 0,
		        max: 100
		    },
		    
		    yAxis: {
		        title: {
		        	text:'높이'
		        }
		    },
		    
		    title: {
		        text: ''
		    },
		    
		    tooltip : {
		    	crosshairs : [ true, false ],
		    	useHTML : true,
		    	formatter : function() {
		    		var content = '<p>맨홀 : ' + this.point.id + '</p>';
		    		if (this.point.name != "") content += '<p>하수관로 : ' + this.point.name + '</p>';
		    		return content;
		    	}
		    },
		    
		    series: [
		    	{
			        type: 'scatter',
			        name: ' ',
			        color: '#BBBBBB',
			        data : (function() {
			        	
						var in_data = [];
			        	for (var z = 0; z < manhArray.length; z++) {
			        		var pipe_name = "";
			        		if (pipeId_str.length > z) 
			        			pipe_name = pipeId_str[z];
			        		var item = { x:Number(manhArray[z][1]),  y:100, id: manhArray[z][0] , name:pipe_name};
			        		
			        		//console.log("관저고 맨홀 x   > " + Number(manhArray[z][1]));
			        		//console.log("관저고 맨홀 y   > " + Number(pipeArray[z][1]));
			        		
			        		in_data.push( item );
			        	}
			        	
						return in_data;
			        })(),
			        marker: {
			        	symbol: 'circle',
			            radius: 0
			        }
		    	},
		    	{
			        type: 'line',
			        name: '관저고',
			        color: '#0066FF',
			        data: (function() {
						var data = [];
			        	for (var z = 0; z < pipeArray.length; z++) {
			        		data.push( [Number(pipeArray[z][0]), Number(pipeArray[z][1])] );
			        		
			        		//console.log("관저고 pipe x   > "+Number(pipeArray[z][0]));
			        		//console.log("관저고 pipe y   > "+Number(pipeArray[z][1]));
			        	}													
						return data;
			        })(),
			        	
			        marker: {
			            enabled: false
			        },
			        
			        states: {
			            hover: {
			                lineWidth: 1
			            }
			        },
			        enableMouseTracking: false,
			        tooltip : {
			        	useHTML : true,
				    	formatter : function() {
				    		return '<p>ID: </p>';
				    	}
			        }
			    },
		    	/*{
			        type: 'scatter',
			        name: '관상고(맨홀)',
			        data : (function() {
			        	
						var in_data =[];
			        	for (var z= 0 ; z < manhArray.length; z++) {
			        		var pipe_name = "";
			        		if(pipeId_str.length > z)	pipe_name = pipeId_str[z];
			        		var item = { x:Number(manhArray[z][1]),  y:Number(pipeArray[z][2]), id: manhArray[z][0] , name:pipe_name};
			        		console.log("관상고 맨홀 x   > "+Number(manhArray[z][1]));
			        		console.log("관상고 맨홀 y   > "+Number(pipeArray[z][2]));
			        		in_data.push( item );
			        	}
			        	
						return in_data;
			        })(),
			        marker: {
			            radius: 5
			        }
		    	},*/
		    	{
			        type: 'line',
			        name: '관상고',
			        color: '#006633',
			        data: (function() {
						var data = [];
			        	for (var z = 0; z < pipeArray.length; z++) {
			        		data.push( [Number(pipeArray[z][0]), Number(pipeArray[z][2])] );
			        		
			        		//console.log("관상고 pipe x   > "+Number(pipeArray[z][0]));
			        		//console.log("관상고 pipe y   > "+Number(pipeArray[z][2]));
			        	}													
						return data;
			        })(),
			        	
			        marker: {
			        	enabled: true,
			    		radius: 5
			        },
			        
			        states: {
			            hover: {
			                lineWidth: 1
			            }
			        },
			        enableMouseTracking: false,
			        tooltip : {
			        	useHTML : true,
				    	formatter : function() {
				    		return '<p>ID: </p>';
				    	}
			        }
			    },
			   /* {
			        type: 'scatter',
			        name: '지표면(맨홀)',
			        data : (function() {
			        	
						var in_data =[];
			        	for (var z= 0 ; z < manhArray.length; z++) {
			        		var pipe_name = "";
			        		if(pipeId_str.length > z)	pipe_name = pipeId_str[z];
			        		var item = { x:Number(manhArray[z][1]),  y:Number(pipeArray[z][3]), id: manhArray[z][0] , name:pipe_name};
			        		console.log("지표면 맨홀 x   > "+Number(manhArray[z][1]));
			        		console.log("지표면 맨홀 y   > "+Number(pipeArray[z][3]));
			        		in_data.push( item );
			        	}
			        	
						return in_data;
			        })(),
			        marker: {
			            radius: 5
			        }
		    	},*/
		    	{
			        type: 'line',
			        name: '지표면',
			        color: '#CC6600',
			        data: (function() {
						var data = [];
			        	for (var z = 0; z < pipeArray.length; z++) {
			        		data.push( [Number(pipeArray[z][0]), Number(pipeArray[z][3])] );
			        		
			        		//console.log("지표면 pipe x   > "+Number(pipeArray[z][0]));
			        		//console.log("지표면 pipe y   > "+Number(pipeArray[z][3]));
			        	}													
						return data;
			        })(),
			        	
			        marker: {
			            enabled: true,
			    		radius: 5
			    
			        },
			        
			        states: {
			            hover: {
			                lineWidth: 1
			            }
			        },
			        enableMouseTracking: false,
			        tooltip : {
			        	useHTML : true,
				    	formatter : function() {
				    		return '<p>ID: </p>';
				    	}
			        }
			    }
		    ]
		});
		$("#chart-form").dialog("open");
	},
	//파이프 라인 아이디로 파이프 지오메트리 값 찾는 함수
	selectPipeID: function() {
		
	},
	// 시설물 하이라이트 표시 (관로 아이디 표시)
	drawHighLightObject: function() {
		
	}
}