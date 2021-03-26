

recreate_view() {
    view=$1
    sqlfile=$2
    bq rm -f $view
    query=`cat $sqlfile`
    bq mk --use_legacy_sql=false --view "$query"  $view
    bq query --use_legacy_sql=false "select count(*) as count from \`$view\`"
}

#recreate_view my_dataset.CDC-county-test-all CDC-county-test-all.sql
#recreate_view my_dataset.CDC-county-test-latest CDC-county-test-latest.sql
recreate_view my_dataset.covid-19-county-official-view covid-19-county-official-view.sql

# recreate_view my_dataset.NYT-covid-latest NYT-covid-latest.sql
# recreate_view my_dataset.ESRI-Covid-Lastday ESRI-Covid-Lastday.sql
# recreate_view my_dataset.nyt-missingfips nyt-missingfips.sql
# recreate_view my_dataset.nyt-missing-county-cases nyt-missing-county-cases.sql
# recreate_view official.county-cases-all county-cases-all.sql
# recreate_view official.msa-cases-all msa-cases-all.sql
# recreate_view official.state-cases-all state-cases-all.sql
# recreate_view official.us-cases-all us-cases-all.sql
