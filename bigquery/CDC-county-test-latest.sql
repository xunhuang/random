SELECT State_name as state, county, format("%05d",fips_code) as fips,
 total_test_results_reported_7_day_count_change as test_7day_total,
 percent_test_results_reported_positive_last_7_days as positivity_7day_avg,
 FORMAT_DATETIME('%Y-%m-%d',DATETIME(entry.report_date)) as date,
 community_transmission_level as community,
 school_composite as school,
 FROM (select distinct  * from `my_dataset.CDC-County-Test-Time-Series-new`) as entry
 INNER JOIN (SELECT fips_code as fips, max(report_date) as report_date,
 FROM `my_dataset.CDC-County-Test-Time-Series-new` 
group by fips ) as lastreport 
 ON 
 entry.report_date = lastreport.report_date 
 and entry.fips_code = lastreport.fips