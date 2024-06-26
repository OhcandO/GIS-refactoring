-- MOGIS 용 기본 GIS 정보 스펙을 작성

-- Map 과 View 설정
create table MOGIS_SPEC_MAP (
    MAP_ID number primary key,
    map_title VARCHAR2(20),
	coor_x varchar2(30), --view 객체 SRID에 따른 x 좌표, 경도, longitude
	coor_y varchar2(30), --view 객체 SRID에 따른 y 좌표, 위도, latitude
    zoom_min number, 
    zoom_max number,
    SRID VARCHAR2(10) default 'EPSG:3857', -- VIEW 객체의 SRID
    note VARCHAR2(200)
);

-- MOGIS.MOGIS_SPEC_SRC definition
CREATE TABLE "MOGIS_SPEC_SRC" (
    "SOURCE_ID" NUMBER primary key, 
	"SOURCE_TITLE" VARCHAR2(20), 
	"CATEGORY" VARCHAR2(20), -- 서비스의 출처 구분 vworld, geoserver, emap, geojson etc.
	"SOURCE_TYPE" VARCHAR2(40), -- vector, xyz, wmts etc.
	"ORIGIN" VARCHAR2(40), 
	"SOURCE_PATHNAME" VARCHAR2(100) NOT NULL ENABLE, 
	"API_KEY" VARCHAR2(500), 
	"SRID" VARCHAR2(10),  -- 개별 소스의 SRID'EPSG:4326', 'EPSG:5181' etc.
	"RGST_DT" DATE, 
	"NOTE" VARCHAR2(4000), 
	 PRIMARY KEY ("SOURCE_ID")
   );

-- Layer 와 Style 설정 (Foreign Key)
-- 개별 레이어의 CQL_FILETER, STYLE 등을 정하는 테이블
create table MOGIS_SPEC_LAYER(
    LAYER_ID NUMBER primary key,
    TITLE VARCHAR2(50), -- this will be shown in viewport
    SOURCE_ID number,
    UPPER_LAYER_ID number,
  	TABLE_NAME VARCHAR2(30), --actual reference table in Scheme
    LAYER_TYPE VARCHAR2(10), --POLYGON, LINE, POINT
    MIN_ZOOM number,
    CQLFILTER VARCHAR2(2000),
    BOOL_USE_YN VARCHAR2(1),
    BOOL_ISGROUP VARCHAR2(1),
    BOOL_SELECTABLE VARCHAR2(1),
    BOOL_EDITABLE VARCHAR2(1),
    BOOL_ISDEFAULT VARCHAR2(1),
    BOOL_DOWNLOAD VARCHAR2(1),
	LINE_STYLE VARCHAR2(20), -- only for POLYGON and LINE
	LINE_WIDTH VARCHAR2(20), -- only for POLYGON and LINE
    ICON_NAME VARCHAR2(30), -- only for POINT
    FONT VARCHAR2(100), --spec : https://developer.mozilla.org/en-US/docs/Web/CSS/font
    LABEL_COLUMN VARCHAR2(10), 
    COLOR_FILL VARCHAR2(20), --rgba(170, 50, 220, .6)
    COLOR_LINE VARCHAR2(20), --rgba(170, 50, 220, .6)
    COLOR_FONT_OUTLINE VARCHAR2(20), 
    COLOR_FONT_FILL VARCHAR2(20), 
    ORDR number,
    RGST_DT date
);


CREATE TABLE "MOGIS_SPEC_LAYER" (
    "LAYER_ID" NUMBER, 
	"LAYER_TITLE" VARCHAR2(50), 
	"SOURCE_ID" NUMBER, 
	"UPPER_LAYER_ID" NUMBER, 
	"TYPE_NAME" VARCHAR2(30), 
	"LAYER_TYPE" VARCHAR2(10), 
	"MIN_ZOOM" NUMBER, 
	"CQLFILTER" VARCHAR2(2000), 
	"BOOL_USE_YN" VARCHAR2(1), 
	"BOOL_ISGROUP" VARCHAR2(1), 
	"BOOL_SELECTABLE" VARCHAR2(1), 
	"BOOL_EDITABLE" VARCHAR2(1), 
	"BOOL_ISDEFAULT" VARCHAR2(1), 
	"BOOL_DOWNLOAD" VARCHAR2(1), 
	"LINE_STYLE" VARCHAR2(20), 
	"LINE_WIDTH" VARCHAR2(20), 
	"ICON_NAME" VARCHAR2(30), 
	"FONT" VARCHAR2(100), 
	"LABEL_COLUMN" VARCHAR2(10), 
	"COLOR_FILL" VARCHAR2(20), 
	"COLOR_LINE" VARCHAR2(20), 
	"COLOR_FONT_OUTLINE" VARCHAR2(20), 
	"COLOR_FONT_FILL" VARCHAR2(20), 
	"ORDR" NUMBER, 
	"RGST_DT" DATE, 
	 CONSTRAINT "MOGIS_SPEC_LAYER_PK" PRIMARY KEY ("LAYER_ID") ENABLE
   ) ;
ALTER TABLE "MOGIS_SPEC_LAYER" ADD CONSTRAINT "SOURCE_ID_FK" FOREIGN KEY ("SOURCE_ID") REFERENCES "MOGIS_SPEC_SRC" ("SOURCE_ID") ENABLE;

----------------------
INSERT INTO MOGIS_SPEC_SRC (SOURCE_ID,SOURCE_TITLE,ORIGIN,SOURCE_TYPE,SRID,SOURCE_PATHNAME,API_KEY,RGST_DT,NOTE,CATEGORY) VALUES (1,'vworld_2d_old','http://xdworld.vworld.kr:8080','xyz','EPSG:3857','http://xdworld.vworld.kr:8080/2d/Base/service/{z}/{x}/{y}.png',NULL,TIMESTAMP'2023-10-04 17:47:37.0','legacy vworld 2D 일반지도 (png)','vworld');
INSERT INTO MOGIS_SPEC_SRC (SOURCE_ID,SOURCE_TITLE,ORIGIN,SOURCE_TYPE,SRID,SOURCE_PATHNAME,API_KEY,RGST_DT,NOTE,CATEGORY) VALUES (2,'vworld_sate_old','http://xdworld.vworld.kr:8080','xyz','EPSG:3857','http://xdworld.vworld.kr:8080/2d/Satellite/service/{z}/{x}/{y}.jpeg',NULL,TIMESTAMP'2023-10-04 17:47:37.0','legacy vworld 2D 위성지도 (jpeg)','vworld');
INSERT INTO MOGIS_SPEC_SRC (SOURCE_ID,SOURCE_TITLE,ORIGIN,SOURCE_TYPE,SRID,SOURCE_PATHNAME,API_KEY,RGST_DT,NOTE,CATEGORY) VALUES (3,'vworld_wmts','https://api.vworld.kr','wmts','EPSG:3857','./external/vworld_getCompatibilities.xml','B58E48FE-683E-3E7E-B91C-2F912512FE60',TIMESTAMP'2023-10-04 17:47:37.0','apikey expired: 2023-12-31','vworld');

INSERT INTO MOGIS_SPEC_LAYER (LAYER_ID,LAYER_TITLE,SOURCE_ID,UPPER_LAYER_ID,TYPE_NAME,LAYER_TYPE,MIN_ZOOM,CQLFILTER,BOOL_USE_YN,BOOL_ISGROUP,BOOL_SELECTABLE,BOOL_EDITABLE,BOOL_ISDEFAULT,BOOL_DOWNLOAD,LINE_STYLE,LINE_WIDTH,ICON_NAME,FONT,LABEL_COLUMN,COLOR_FILL,COLOR_LINE,COLOR_FONT_OUTLINE,COLOR_FONT_FILL,ORDR,RGST_DT) VALUES (1,'vworld_base',3,NULL,'Base','BaseLayer',NULL,NULL,'Y',NULL,NULL,NULL,'Y',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,TIMESTAMP'2023-10-05 17:24:16.0');
INSERT INTO MOGIS_SPEC_LAYER (LAYER_ID,LAYER_TITLE,SOURCE_ID,UPPER_LAYER_ID,TYPE_NAME,LAYER_TYPE,MIN_ZOOM,CQLFILTER,BOOL_USE_YN,BOOL_ISGROUP,BOOL_SELECTABLE,BOOL_EDITABLE,BOOL_ISDEFAULT,BOOL_DOWNLOAD,LINE_STYLE,LINE_WIDTH,ICON_NAME,FONT,LABEL_COLUMN,COLOR_FILL,COLOR_LINE,COLOR_FONT_OUTLINE,COLOR_FONT_FILL,ORDR,RGST_DT) VALUES (2,'vworld_Satellite',3,NULL,'Satellite','BaseLayer',NULL,NULL,'Y',NULL,NULL,NULL,'N',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,TIMESTAMP'2023-10-05 17:24:16.0');
INSERT INTO MOGIS_SPEC_LAYER (LAYER_ID,LAYER_TITLE,SOURCE_ID,UPPER_LAYER_ID,TYPE_NAME,LAYER_TYPE,MIN_ZOOM,CQLFILTER,BOOL_USE_YN,BOOL_ISGROUP,BOOL_SELECTABLE,BOOL_EDITABLE,BOOL_ISDEFAULT,BOOL_DOWNLOAD,LINE_STYLE,LINE_WIDTH,ICON_NAME,FONT,LABEL_COLUMN,COLOR_FILL,COLOR_LINE,COLOR_FONT_OUTLINE,COLOR_FONT_FILL,ORDR,RGST_DT) VALUES (3,'vworld_gray',3,NULL,'gray','BaseLayer',NULL,NULL,'Y',NULL,NULL,NULL,'N',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,TIMESTAMP'2023-10-05 17:24:16.0');
INSERT INTO MOGIS_SPEC_LAYER (LAYER_ID,LAYER_TITLE,SOURCE_ID,UPPER_LAYER_ID,TYPE_NAME,LAYER_TYPE,MIN_ZOOM,CQLFILTER,BOOL_USE_YN,BOOL_ISGROUP,BOOL_SELECTABLE,BOOL_EDITABLE,BOOL_ISDEFAULT,BOOL_DOWNLOAD,LINE_STYLE,LINE_WIDTH,ICON_NAME,FONT,LABEL_COLUMN,COLOR_FILL,COLOR_LINE,COLOR_FONT_OUTLINE,COLOR_FONT_FILL,ORDR,RGST_DT) VALUES (4,'vworld_midnight',3,NULL,'midnight','BaseLayer',NULL,NULL,'Y',NULL,NULL,NULL,'N',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,TIMESTAMP'2023-10-05 17:24:16.0');
INSERT INTO MOGIS_SPEC_LAYER (LAYER_ID,LAYER_TITLE,SOURCE_ID,UPPER_LAYER_ID,TYPE_NAME,LAYER_TYPE,MIN_ZOOM,CQLFILTER,BOOL_USE_YN,BOOL_ISGROUP,BOOL_SELECTABLE,BOOL_EDITABLE,BOOL_ISDEFAULT,BOOL_DOWNLOAD,LINE_STYLE,LINE_WIDTH,ICON_NAME,FONT,LABEL_COLUMN,COLOR_FILL,COLOR_LINE,COLOR_FONT_OUTLINE,COLOR_FONT_FILL,ORDR,RGST_DT) VALUES (5,'vworld_Hybrid',3,NULL,'Hybrid','BaseLayer',NULL,NULL,'Y',NULL,NULL,NULL,'N',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,TIMESTAMP'2023-10-05 17:24:16.0');


