SELECT
    date,
    sum (confirmed_cases) as confirmed_cases,
    sum(deaths) as deaths
FROM `myrandomwatch-b4b41.official.county-cases-all`
group by date
order by date desc
