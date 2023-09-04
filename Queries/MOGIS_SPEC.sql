-- MOGIS 용 기본 GIS 정보 스펙을 작성

-- Map 과 View 설정
create table MOGIS_SPEC_MAP (
    id number primary key,
    title varchar2(20),
    zoom_min number,
    zoom_max number,
    crs varchar2(10),
    note varchar2(200)
);

-- Source 설정
create table MOGIS_SPEC_SRC (
    id number primary key,
    title varchar2(20),
    source_type, varchar2(40), -- XYZ, WMTS 등
    url varchar2(100),
    API_KEY varchar2(500),
    rgst_dt date,
    note varchar2(4000)
);

-- insert into MOGIS_SPEC_SRC 
-- select 1, 'Vworld'

-- Layer 와 Style 설정
create table MOGIS_SPEC_LAYER(
    ID number primary key,
    UPPER_ID number,
    TITLE VARCHAR2(50), -- this will be shown in viewport
	TABLE_NAME VARCHAR2(30), --actual reference table in Scheme
    LAYER_TYPE varchar2(10), --POLYGON, LINE, POINT
    MIN_ZOOM number,
    CQLFILTER varchar2(2000),
    -- SRC_URL varchar2(300), -- '/geoserver/wfs/...'
    BOOL_USE_YN char(1),
    BOOL_ISGROUP char(1),
    BOOL_SELECTABLE char(1),
    BOOL_EDITABLE char(1),
    BOOL_ISDEFAULT char(1),
    BOOL_DOWNLOAD char(1),
	LINE_STYLE VARCHAR2(20), -- only for POLYGON and LINE
	LINE_WIDTH VARCHAR2(20), -- only for POLYGON and LINE
    ICON_NAME varchar2(30), -- only for POINT

    FONT varchar2(100), --spec : https://developer.mozilla.org/en-US/docs/Web/CSS/font
    LABEL_COLUMN varchar2(10), 
    COLOR_FILL varchar2(20), --rgba(170, 50, 220, .6)
    COLOR_LINE varchar2(20), --rgba(170, 50, 220, .6)
    COLOR_FONT_OUTLINE varchar2(20), 
    COLOR_FONT_FILL varchar2(20), 
    ORDR number,
    RGST_DT, date,
);
