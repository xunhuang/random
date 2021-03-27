
datasetlist="my_dataset mydataset2 official"
for dataset in $datasetlist
do
  viewlist=`bq ls --format=prettyjson $dataset | jq -r '. [] | select (.type == "VIEW") | .tableReference.datasetId + "."+  .tableReference.tableId'`
  for i in $viewlist
  do
   bq show --format=prettyjson $i > $i.json
  done
done
