
select
date, county, state_name, county_fips_code.county_fips_code, confirmed_cases, deaths, state_fips_code

from  `bigquery-public-data.covid19_nyt.us_counties` as nyt

LEFT OUTER JOIN `myrandomwatch-b4b41.mydataset2.fips_code_county` as county_fips_code
ON nyt.county_fips_code = county_fips_code.county_fips_code

where date =
(SELECT max(date) FROM `bigquery-public-data.covid19_nyt.us_counties` )
