select legit.county_fips_code from `myrandomwatch-b4b41.mydataset2.fips_code_county` as legit
join
(select distinct   county_fips_code, jhu.fips  from `bigquery-public-data.covid19_jhu_csse.summary` as jhu
left outer join  `myrandomwatch-b4b41.my_dataset.NYT-covid-latest` as nyt
on nyt.county_fips_code = jhu.fips
where nyt.county_fips_code  is null) as missing_fips
on legit.county_fips_code = missing_fips.fips
