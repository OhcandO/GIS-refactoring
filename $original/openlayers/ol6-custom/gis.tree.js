/**
 * GisApp.tree
 * @requires gis.core.js
 */
GisApp.tree = function(options) {
	this.initialize(options);
};

GisApp.tree.prototype = {
	defaults: {
		contextPath: "",
		iconPath: "",
		targetId: "tree-layer-control",
		treeList: null
	},
	instance: null,
	targetElement: null,
	initialize: function(options) {

		$.extend(this.defaults, options);
		this.defaults.treeList = GisApp.layerInfos;
		this.targetElement = document.getElementById(this.defaults.targetId);
		if (!this.targetElement) return;
		
		this.defaults.iconPath = GisApp.CONTEXT_PATH + "images/layericon/";
		this.createTree(this.defaults.treeList);
		this.checkEventListener();
		this.selectableTree(this.defaults.treeList);
	},
	/**
	 * 트리 html 생성 리턴
	 */
	createWrap: function(array, level) {
		let html = "";
		level = level || 1;

		for (let i = 0; i < array.length; i++) {
			let layer = array[i];
			let id = layer.id
			let name = layer.name;
			let type = layer.type;
			let isLayer = layer.isLayer || "N";
			let hasChild = false;

			if (layer.childList && layer.childList.length > 0) {
				hasChild = true;
			}

			if (level == 1) {
				html += "<ul>";
			}

			if (isLayer == "Y") {
				let src = this.makeLegendSrc(layer);
				html += "<li id='layerid_" + id + "' data-layerid='" + id + "' data-type='" + type + "' class='" + type + " " + id + "'>" + "<img src='" + src + "' style= 'width:16px;'  />&nbsp;&nbsp;" + name + "</li>";
			} else {
				html += "<li id='" + id + "'>" + name;
				html += "<ul>";
			}

			if (hasChild) {
				level++;
				html += this.createWrap(layer.childList, level);
				html += "</ul></li>";
				level--;
			}

			if (level == 1) {
				html += "</ul>";
			}

		}

		return html;
	},
	/**
	 * jstree 생성
	 */
	createTree: function(treeList) {
		let wrap = this.createWrap(treeList);
		$(this.targetElement).html(wrap);
		$(".map_info a").trigger("click");
		$(this.targetElement).jstree({
			"core": {
				"themes": {
					"icons": false
				}
			},
			"plugins": ["wholerow", "checkbox"]
		});

		this.instance = $(this.targetElement).jstree(true);
	},
	/**
	 * 초기 선택 노드 셋팅
	 */
	selectableTree: function(array) {

		for (let i = 0; i < array.length; i++) {

			let layer = array[i];
			let id = layer.id
			let visible = layer.visible || "N";
//			let hasChild = false;

			if (layer.childList && layer.childList.length > 0) {
//				hasChild = true;
				this.selectableTree(layer.childList);
			}

			if (visible === "Y") {
				let tnode = this.instance.get_node('layerid_' + id);
				if (!tnode) continue;
				if (tnode.state.selected == false) {
					this.instance.check_node(tnode);
				}
			}

//			if (hasChild) {
//				this.selectableTree(layer.childList);
//			}
		}
	},
	/**
	 * 체크박스 선택시 이벤트
	 */
	checkEventListener: function() {
		let core = GisApp.Module.core;
		let nodeId;
		$(this.targetElement).bind("changed.jstree", function(e, data) {
			if (data.action === "ready") return;

			let visible = false;
			if (data.action === "select_node") {
				visible = true;
			}

			let layerList = [];
			if (data.node.children.length > 0) {
				for (let id in data.node.children_d) {
					nodeId = data.node.children_d[id];
					pushLayerList(nodeId, layerList);
				}
			} else {
				nodeId = data.node.id;
				pushLayerList(nodeId, layerList);
			}

			core.setLayerOnMap(layerList, visible);
		});

		let pushLayerList = function(nodeId, layerList) {
			let node = this.instance.get_node(nodeId);
			let layerid;
			if (nodeId.indexOf("layerid") > -1) {
				layerid = node.data.layerid;
				layerList.push(layerid);
			}
		}.bind(this);
	},
	/**
	 * 이미지 정보
	 */
	makeLegendSrc: function(layerinfo) {
		let src;
		let iconPath = this.defaults.iconPath;
		if (layerinfo.symbol && layerinfo.symbol != 'none') {
			src = iconPath + layerinfo.symbol;
		} else {
			var ss = this.makeLegendImage(layerinfo);
			src = ss.src;
		}
		return src
	},
	/**
	 * 이미지 생성
	 */
	makeLegendImage: function(layerinfo) {
		let image = document.createElement("img");
		let canvas = document.createElement("canvas");
		canvas.width = 16;
		canvas.height = 16;
		let ctx = canvas.getContext("2d");
		ctx.beginPath();

		if (layerinfo.type == "POLYGON") {
			ctx.moveTo(1, 1);
			ctx.lineTo(15, 1);
			ctx.lineTo(15, 15);
			ctx.lineTo(1, 15);
			ctx.lineTo(1, 1);
		} else if (layerinfo.type == "POLYLINE") {
			ctx.moveTo(1, 15);
			ctx.lineTo(5, 1);
			ctx.lineTo(9, 15);
			ctx.lineTo(15, 1);
		} else {
			ctx.moveTo(1, 1);
			ctx.lineTo(15, 1);
			ctx.lineTo(15, 15);
			ctx.lineTo(1, 15);
			ctx.lineTo(1, 1);
		}

		if (layerinfo.type == "POLYGON") {
			ctx.fillStyle = 'rgba(' + layerinfo.fillcolorr + ',' + layerinfo.fillcolorg + ',' + layerinfo.fillcolorb + ',' + layerinfo.fillcolora + ')';
			ctx.fill();
		};

		if (layerinfo.linewidth) {
			ctx.lineWidth = layerinfo.linewidth;
			ctx.strokeStyle = "rgba(" + layerinfo.linecolorr + ", " + layerinfo.linecolorg + ", " + layerinfo.linecolorb + ", " + layerinfo.linecolora + ")";
			ctx.stroke();
		}

		image.src = canvas.toDataURL("image/png");
		return image;
	},
	/**
	 * 아이디로 체크박스 선택 
	 */
	checkTreeOfId: function(id) {
		let boolean = this.instance.is_selected(id);
		if (!boolean) {
			this.instance.select_node(id);
		}
	},
	
	hideLayerThroughTableName: function(typeName) {
		let tempTreeIdArr = this.getTreeIdArr(typeName);
		if (tempTreeIdArr.length > 0) {
			tempTreeIdArr.forEach((treeId) => {
				this.instance.deselect_node(treeId);
			});
		}
	},
	
	showALayer: function(typeName, ftrIdn) {
		if(ftrIdn){
			let tempTreeIdArr = this.getTreeIdArr(typeName, ftrIdn);
			if (tempTreeIdArr.length > 0) {
				tempTreeIdArr.forEach((treeId) => {
					this.instance.select_node(treeId);
				});
			}
		}else{	console.log(`gis_tree.showALayer() | 관리번호 (ftrIdn) 미지정`);		}
	},
	getTreeIdArr: function(typeName, ftrIdn='') {
		let codeObjArr = [].concat(Object.values(GisApp.layerCode)
			.filter((codeObj) => codeObj.typeName === typeName && codeObj.isLayer === "Y"));
		if (typeName == 'WTL_BLSM_AS' && ftrIdn) {
			codeObjArr = codeObjArr.filter(codeObj => codeObj.fullname == ftrIdn);
		}
		if (codeObjArr.length > 0) {
			return codeObjArr.map(codeObj => "layerid_" + codeObj.id);
		} else {
			return [];
		}
	},
	/**
	* 레이어 활성화 안됐을 때 GisApp.LayerCode 에서 레이어 코드 찾아 노드 선택 이벤트 진행
	@param {String} typeName-tree에서 활성화하려는 GIS 테이블 이름
	 */
	showLayerWithTreeThroughTableName_Promise: function(typeName) {
		
		
		let minZoom = 16;
		/**
		 * 테이블이름과 관련된 레이어들 코드정보 객체 찾아 내부 변수로 등록. 찾으면 true
		 */
		let findAndSetLayerCodeObjWithTypename = (typeName) => {
			let codeObjArr = getCodeObjArrOfTypeName_(typeName);
			if (codeObjArr.length > 0) {
				return tempTreeIdArr = codeObjArr.reduce((pre, cur) => (pre.push("layerid_" + cur.id), pre), []);
			} else {
				return false;
			}
		};

		/**입력된 typeName 을 속성으로 하는 GisApp.LayerCode 의 요소들을 추출
		 */
		let getCodeObjArrOfTypeName_ = (typeName) => {
			let codeObjArr = Object.values(GisApp.layerCode)
				.filter((codeObj) => codeObj.typeName === typeName && codeObj.isLayer === "Y");

			//평택은 가압장과 가압장 영향범위를 같이 표현
			if (mgcNm === '평택' && typeName === "WTL_PRES_PS") {
				let prsaCodeObjArr = getCodeObjArrOfTypeName_("WTL_PRSA_AS");
				codeObjArr = [].concat(codeObjArr, prsaCodeObjArr);
			}
			
			//layerCode 상 같은 typeName 사용하는 레이어의 줌 레벨 선택
			minZoom = codeObjArr.reduce((pre,cur)=>(cur.minZoom > pre? Number(cur.minZoom) : pre),10);
			return codeObjArr;
		};
		
		/**treeID 배열의 모든 요소가 선택된 상태인지 확인. instance는 jstree임 객체
		 */
		let isEveryLayerNodeSelected = (treeIdArr) => {
			return treeIdArr.every(nodeId => this.instance.is_selected(nodeId));
		};

		let tempTreeIdArr = [];

		// 입력된 typeName 을 속성으로 하는 GisApp.LayerCode 의 요소들의 id 를 추출
		if (!(this.tempLayerIdArr && this.tempLayerIdArr.length > 0)) {
			tempTreeIdArr = findAndSetLayerCodeObjWithTypename(typeName);
			if (tempTreeIdArr.length === 0) {
				return new Promise((_res, rej) => {
					rej("시설물 화면에 맞는 레이어 없음. 시설물 테이블명 : " + typeName);
				});
			}
		}
		return new Promise((reso, _reje) => {
			//1. 노드가 이미 선택되어 있다면 바로 다음 Prmomise chaining 호출
			if (isEveryLayerNodeSelected(tempTreeIdArr)) {
				reso();

				//2. 노드 선택 직후 레이어 활성화 딜레이 계산
			} else {
				//해당 레이어가 발행되도록 줌 레벨 조정
				GisApp.Module.core.map.getView().setZoom(minZoom+0.2);
				
				GisApp.Module.core.map.once('rendercomplete', function(e) {
					hideLoadingBar('#'+GisApp.Module.core.defaults.targetId);
					reso();
				});
				
				showLoadingBar('#'+GisApp.Module.core.defaults.targetId);
				tempTreeIdArr.forEach((treeId) => {
					this.instance.select_node(treeId);
				});
			}
		});


	},


}