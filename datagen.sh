
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

# cat website/build/data/testing/states.json | jq -cr 'group_by(.fips) | .[] | .[0].fips as $k | "\($k)\t\(.)" ' | awk -F\\t '{fname="website"$1".json"; print $2> fname;close(fname)}'

getTestingData() {
   testing_dir='website/build/data/testing'
   mkdir -p $testing_dir
   f="$(getHealthDataGovURL https://healthdata.gov/dataset/covid-19-diagnostic-laboratory-testing-pcr-testing-time-series.xml )"
   curl -s $f | npx csvtojson | jq -f website/state.jq > $testing_dir/states.json
   datasplit $testing_dir/states.json state $testing_dir/
}

getHospitalization() {
   target_dir='website/build/data/hospitalization'
   mkdir -p $target_dir
   f="$(getHealthDataGovURL https://healthdata.gov/dataset/covid-19-reported-patient-impact-and-hospital-capacity-state-timeseries.xml)"
   # curl -s $f | npx csvtojson | jq -f website/state.jq > $target_dir/states.json
   curl -s $f | npx csvtojson  > $target_dir/states-original.json
   jq -f website/hospitalization.jq  $target_dir/states-original.json > $target_dir/states.json 
   datasplit $target_dir/states.json state $target_dir/
}

getTestingData
getHospitalization