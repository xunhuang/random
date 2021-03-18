
datasplit() {
    filetosplit=$1
    attr=$2
    outputfile_prefix=$3
    jq_params="group_by(.$attr) | .[] | .[0].$attr as \$k | \"\(\$k)\t\(.)\" "
    awk_params='{fname="'$outputfile_prefix'"$1".json"; print $2> fname;close(fname)}'
    cat $filetosplit | jq -cr "$jq_params" | awk -F\\t "$awk_params"
}

getHealthDataGovURL() {
    curl -s -L $1 | xmlstarlet sel -t -v "/rdf:RDF/dcat:Distribution/dcat:downloadURL/@rdf:resource"
}

getTestingData() {
   target_dir='website/build/data/testing'
   mkdir -p $target_dir
   f=`curl -L -S https://healthdata.gov/resource/w3ft-93it.json |jq -r ' .[-1] |.archive_link | .url'`
   curl -s $f | npx csvtojson > $target_dir/states-original.json
   cat $target_dir/states-original.json | jq -f website/state.jq > $target_dir/states.json
   datasplit $target_dir/states.json state $target_dir/
   cat $target_dir/states.json  | jq -f website/testingUSSummarize.jq  > $target_dir/USA.json
   cat $target_dir/states.json  | jq -f website/testingStateTable.jq  > $target_dir/states-last.json
}

getHospitalization() {
   target_dir='website/build/data/hospitalization'
   mkdir -p $target_dir
   f=`curl -L -S https://healthdata.gov/resource/qqte-vkut.json |jq -r ' .[-1] |.archive_link | .url'`
   curl -s $f | npx csvtojson  > $target_dir/states-original.json
   jq -f website/hospitalization.jq  $target_dir/states-original.json > $target_dir/states.json 
   datasplit $target_dir/states.json state $target_dir/
   cat $target_dir/states.json  | jq -f website/hospitalizationUSSummarize.jq  > $target_dir/USA.json
}

echo "fetching CDC County Data"
target_dir='website/build/data/testing'
mkdir -p $target_dir
node BigQuery.js -t my_dataset.CDC-county-test-all > $target_dir/cdc-county-testing-all.json
node BigQuery.js -t my_dataset.CDC-county-test-latest > $target_dir/cdc-county-testing-latest.json

echo "fetching testing data from Health Data.gov"
getTestingData
echo "fetching hospitalization data from Health Data.gov"
getHospitalization
