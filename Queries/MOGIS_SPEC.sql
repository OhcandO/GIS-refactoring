-- MOGIS 용 기본 GIS 정보 스펙을 작성

-- Map 과 View 설정
create table MOGIS_SPEC_MAP (
    MAP_ID number primary key,
    title VARCHAR2(20),
    zoom_min number, 
    zoom_max number,
    SRID VARCHAR2(10), -- VIEW 객체의 SRID
    note VARCHAR2(200)
);

-- Source 설정 (Primary Key)
-- 지도 객체의 출처를 명시하는 테이블
create table MOGIS_SPEC_SRC (
    SOURCE_ID number primary key,
    TITLE VARCHAR2(20),
    DOMAIN VARCHAR2(20), -- 서비스의 출처 vworld, geoserver, emap, geojson etc.
    SOURCE_TYPE, VARCHAR2(40), -- vector, xyz, wmts etc.
    SRID, varchar2(10), -- 'EPSG:4326', 'EPSG:5181' etc.
    SOURCE_URL VARCHAR2(100) not null, 
    API_KEY VARCHAR2(500),
    RGST_DT date,
    NOTE VARCHAR2(4000)
);

-- Layer 와 Style 설정 (Foreign Key)
-- 개별 레이어의 CQL_FILETER, STYLE 등을 정하는 테이블
create table MOGIS_SPEC_LAYER(
    LAYER_ID number primary key,
    TITLE VARCHAR2(50), -- this will be shown in viewport
    SOURCE_ID number,
    UPPER_LAYER_ID number,
	TABLE_NAME VARCHAR2(30), --actual reference table in Scheme
    LAYER_TYPE VARCHAR2(10), --POLYGON, LINE, POINT
    MIN_ZOOM number,
    CQLFILTER VARCHAR2(2000),
    BOOL_USE_YN char(1),
    BOOL_ISGROUP char(1),
    BOOL_SELECTABLE char(1),
    BOOL_EDITABLE char(1),
    BOOL_ISDEFAULT char(1),
    BOOL_DOWNLOAD char(1),
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
    RGST_DT, date,
);
