# download tables for google's big query

tables="\
    official.state-cases-all\
    official.county-cases-all\
    official.us-cases-all\
    official.msa-cases-all\
    official.states-hospitalization 
    official.states-testing 
    official.us-hospitalization 
    official.us-testing"
tables=""

for table in $tables
do
 echo Downloading $table
 ts-node ../ts-out/BigQuery.js -t $table \
 | jq -c " .[] | . + {date: .date.value, } " | json2csv  > $table.csv
done

nondate="official.states-summary \
official.us-summary \
my_dataset.covid-19-county-official-view \
mydataset2.msa_definition_clean \
mydataset2.fip_codes_states \
mydataset2.fips_code_county \
mydataset2.us_county_health_department"

for table in $nondate
do
 echo Downloading $table
   ts-node ../ts-out/BigQuery.js -t $table \
| jq -c " .[]" | json2csv  > $table.csv
done 