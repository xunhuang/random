
bq rm -f my_dataset.myview
query=`cat CDC-county-test-all.sql`    
bq mk --use_legacy_sql=false --view "$query"  my_dataset.myview
