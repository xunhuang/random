

recreate_view() {
    view=$1
    sqlfile=$2
    bq rm -f $view
    query=`cat $sqlfile`    
    bq mk --use_legacy_sql=false --view "$query"  $view
    bq query --use_legacy_sql=false "select count(*) as count from \`$view\`"
}

recreate_view my_dataset.CDC-county-test-all CDC-county-test-all.sql
recreate_view my_dataset.CDC-county-test-latest CDC-county-test-latest.sql


