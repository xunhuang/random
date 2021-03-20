SELECT distinct State_name as state, county, format("%05d",fips_code) as fips,
 total_test_results_reported_7_day_count_change as test_7day_total,
 percent_test_results_reported_positive_last_7_days as positivity_7day_avg,
 report_date as date,
testing_end_date,
 community_transmission_level as community,
 school_composite as school,
 FROM `my_dataset.CDC-County-Test-Time-Series-new`