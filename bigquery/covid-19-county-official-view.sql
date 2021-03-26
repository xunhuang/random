SELECT
       county.state_fips_code as state_fips_code,
       county.county_fips_code as county_fips_code,
       state,
       county.area_name as county,
       lastesri.confirmed_cases,
       lastesri.deaths,
       test_7day_total,
       testlatest.positivity_7day_avg,
       community,
       school,
       testlatest.date AS report_date,
       health.websites AS healthwebsites
FROM `myrandomwatch-b4b41.mydataset2.fips_code_county` AS county
LEFT OUTER JOIN `myrandomwatch-b4b41.mydataset2.us_county_health_department` AS health ON county.county_fips_code = health.fips
LEFT OUTER JOIN `myrandomwatch-b4b41.my_dataset.CDC-county-test-latest` as testlatest ON county.county_fips_code =  testlatest.fips
LEFT OUTER JOIN `myrandomwatch-b4b41.my_dataset.ESRI-Covid-Lastday` as lastesri ON county.county_fips_code =  lastesri.county_fips_code

#test123
