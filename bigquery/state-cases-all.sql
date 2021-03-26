SELECT
date,
state_name,
state_fips_code,
confirmed_cases,
deaths
FROM (
    # last day of state
    SELECT
        date,
        state_fips_code,
        max(state_name) as state_name,
        sum(confirmed_cases) as confirmed_cases,
        sum(deaths) as deaths
        FROM `myrandomwatch-b4b41.my_dataset.ESRI-Covid-Lastday`
        group by state_fips_code, date
)
UNION ALL
SELECT * FROM `bigquery-public-data.covid19_nyt.us_states`
