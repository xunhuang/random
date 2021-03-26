(SELECT
date,
county,
state_name,
county_fips_code,
confirmed_cases,
deaths
FROM `myrandomwatch-b4b41.my_dataset.ESRI-Covid-Lastday`
UNION ALL
SELECT * FROM `bigquery-public-data.covid19_nyt.us_counties`
where county_fips_code is not null  # need to filter out things like NYC's 800K infected.
 )
union distinct
(select date,
county,
state_name,
county_fips_code,
confirmed_cases,
deaths	 from `myrandomwatch-b4b41.my_dataset.nyt-missing-county-cases`  )

union distinct
  # following are items in NYT that are not in JHU, like Utah, nantucket
  (
 select
 (select max(date) FROM `myrandomwatch-b4b41.my_dataset.ESRI-Covid-Lastday`) as date,
 county_fips_code,
  county,
 state_name,
 confirmed_cases,
 deaths FROM `myrandomwatch-b4b41.my_dataset.NYT-covid-latest`
 where
  county_fips_code not in (select county_fips_code FROM `myrandomwatch-b4b41.my_dataset.ESRI-Covid-Lastday`  )
  )
