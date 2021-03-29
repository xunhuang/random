
bq query \
--use_legacy_sql=false \
--parameter='gender::M' \
--parameter='states:ARRAY<STRING>:["WA", "WI", "WV", "WY"]' \
'SELECT e.fips   AS fips,
               missingdate,
               Max(date) AS backfilldate
        FROM   (SELECT allstates.fips AS fips,
                       d.date          AS missingdate
                FROM   (SELECT day as date FROM UNNEST( GENERATE_DATE_ARRAY(DATE("2021-02-01"), CURRENT_DATE(), INTERVAL 1 DAY) ) AS day) AS
                       d,
                       (SELECT DISTINCT fips
                        FROM   `myrandomwatch-b4b41.my_dataset.California-Vaccination-Overtime-clean`) AS
                       allstates
                       LEFT OUTER JOIN
                       `myrandomwatch-b4b41.my_dataset.California-Vaccination-Overtime-clean` AS
                       data
                                    ON d.date = data.date
                                       AND allstates.fips = data.fips
                WHERE  doses_administered IS NULL) AS e
               JOIN `myrandomwatch-b4b41.my_dataset.California-Vaccination-Overtime-clean` AS f
                 ON e.fips = f.fips
                    AND e.missingdate > f.date
        GROUP  BY e.fips,
                  e.missingdate'

# ' SELECT allstates.fips AS fips,
#                        d.date          AS missingdate
#                 FROM   (SELECT day as date FROM UNNEST( GENERATE_DATE_ARRAY(DATE("2021-02-01"), CURRENT_DATE(), INTERVAL 1 DAY) ) AS day) AS
#                        d,
#                        (SELECT DISTINCT fips
#                         FROM   `myrandomwatch-b4b41.my_dataset.California-Vaccination-Overtime-clean`) AS
#                        allstates
#                        LEFT OUTER JOIN
#                        `myrandomwatch-b4b41.my_dataset.California-Vaccination-Overtime-clean` AS
#                        data
#                                     ON d.date = data.date
#                                        AND allstates.fips = data.fips
#                 WHERE  doses_administered IS NULL 
#                 order by fips, missingdate desc
#                 '