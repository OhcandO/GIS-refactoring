create or replace procedure GET_GIS_SPEC {

}

SELECT table_name, column_name FROM user_tab_cols
WHERE 1=1
AND table_name IN (SELECT table_name FROM user_sdo_geom_metadata)
AND hidden_column = 'NO'
AND data_type != 'SDO_GEOMETRY'
AND column_name NOT IN (
	'BLK_NAM', 'FTR_IDN','FTR_IDS','SGCCD','DMNO','FLO_NM','ANG_DIR','GAI_NAM'
)
AND table_name NOT IN ( 
	'WTL_META_PS'
)
AND (table_name, column_name) NOT IN ( )
ORDER BY 1,2
;