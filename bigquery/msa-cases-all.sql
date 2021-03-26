
select * from
(SELECT msa.ID as msd_id, tt.date, sum (tt.confirmed_cases) confirmed_cases, sum(tt.deaths) deaths
FROM `myrandomwatch-b4b41.official.county-cases-all`  tt

join `myrandomwatch-b4b41.mydataset2.msa_definition_clean` as msa
on
tt.county_fips_code = msa.county_fips_code
group by msa.ID, tt.date )
