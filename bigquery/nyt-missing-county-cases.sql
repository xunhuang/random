SELECT * from
(SELECT
date,
fips as county_fips_code,
confirmed as confirmed_cases,
deaths,
admin2 as county,
province_state as state_name
FROM `bigquery-public-data.covid19_jhu_csse.summary`
union all
select
(SELECT DATE(TIMESTAMP_MILLIS(CAST(Last_Update as INT64)))) as date,
FIPS as count_fips_code,
Confirmed as confirmed_cases,
Deaths as deaths,
Admin2 as county,
Province_State as state_name
from `myrandomwatch-b4b41.my_dataset.ESRI_imported_raw`
)
where county_fips_code in (select * from `myrandomwatch-b4b41.my_dataset.nyt-missingfips` )
