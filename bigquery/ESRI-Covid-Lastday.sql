select
    date_add( (select max(date) from `myrandomwatch-b4b41.my_dataset.NYT-covid-latest`), interval  1 day) as date,
    latest.Province_State as state_name,
    latest.Admin2 as county,
    county_code.state_fips_code,
        county_code.county_fips_code,

    GREATEST(ifnull(nyt.confirmed_cases,0), latest.Confirmed) as confirmed_cases,
    GREATEST(ifnull(nyt.deaths, 0), latest.deaths) as deaths,
from
        (SELECT DATE(TIMESTAMP_MILLIS(CAST(Last_Update as INT64))) as date,
            * except (Last_Update)  FROM `myrandomwatch-b4b41.my_dataset.ESRI_imported_raw`) as latest
  left outer JOIN
   `myrandomwatch-b4b41.my_dataset.NYT-covid-latest` as nyt
ON  latest.FIPS = nyt.county_fips_code
LEFT OUTER JOIN `myrandomwatch-b4b41.mydataset2.fips_code_county` as county_code
ON latest.FIPS = county_code.county_fips_code
where county_code.county_fips_code is not null
order by confirmed_cases desc
