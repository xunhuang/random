# generated based on a template with mustache
select * from
(
SELECT 
    backfill.{{group_by_field}} as {{group_by_field}}, 
    missingdate as {{date_field}}, 
    dd.* except({{group_by_field}}, {{date_field}}), 
FROM   
    (
        SELECT e.{{group_by_field}}   AS {{group_by_field}},
               missingdate,
               Max({{date_field}}) AS backfilldate
        FROM   (SELECT allstates.{{group_by_field}} AS {{group_by_field}},
                       d.{{date_field}}          AS missingdate
                FROM   (SELECT {{date_field}} FROM UNNEST( 
                         GENERATE_DATE_ARRAY(DATE('{{start_date}}'), CURRENT_DATE(), INTERVAL 1 DAY) ) AS {{date_field}}
                         ) AS
                       d,
                       (SELECT DISTINCT {{group_by_field}}
                        FROM   {{&table_name}}) AS
                       allstates
                       LEFT OUTER JOIN
                       {{&table_name}} AS
                       data
                                    ON d.{{date_field}} = data.{{date_field}}
                                       AND allstates.{{group_by_field}} = data.{{group_by_field}}
                WHERE  {{null_test_field}} IS NULL) AS e
                JOIN {{&table_name}} AS f ON e.{{group_by_field}} = f.{{group_by_field}} AND e.missingdate > f.{{date_field}}
                GROUP  BY e.{{group_by_field}},
                  e.missingdate
      ) AS backfill
JOIN {{&table_name}} AS dd ON backfill.{{group_by_field}} = dd.{{group_by_field}} AND backfill.backfilldate = dd.{{date_field}}

UNION DISTINCT 
(select {{group_by_field}}, {{date_field}},  * except ({{group_by_field}}, {{date_field}}) from {{&table_name}})
)
ORDER  BY {{group_by_field}}, {{date_field}} desc