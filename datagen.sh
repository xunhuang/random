
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
   echo "fetching testing data from Health Data.gov"
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
   echo "fetching hospitalization data from Health Data.gov"
   target_dir='website/build/data/hospitalization'
   mkdir -p $target_dir
   f=`curl -L -S https://healthdata.gov/resource/qqte-vkut.json |jq -r ' .[-1] |.archive_link | .url'`
   curl -s $f | npx csvtojson  > $target_dir/states-original.json
   jq -f website/hospitalization.jq  $target_dir/states-original.json > $target_dir/states.json
   datasplit $target_dir/states.json state $target_dir/
   cat $target_dir/states.json  | jq -f website/hospitalizationUSSummarize.jq  > $target_dir/USA.json
}

getCDCCountyTesting() {
   echo "fetching CDC County Data"
   target_dir='website/build/data/testing'
   mkdir -p $target_dir
   node BigQuery.js -t my_dataset.CDC-county-test-all > $target_dir/cdc-county-testing-all.json
   node BigQuery.js -t my_dataset.CDC-county-test-latest > $target_dir/cdc-county-testing-latest.json
}

getCountySummary() {
   echo "fetching County Summary Data"
   target_dir='website/build/data/county'
   mkdir -p $target_dir
   node BigQuery.js -t my_dataset.covid-19-county-official-view > $target_dir/county-all.json
   datasplit $target_dir/county-all.json county_fips_code $target_dir/
}

getLatestCovidData() {
   target_dir='website/build/data/county-details'
   mkdir -p $target_dir
   URLNewCasesJHU="https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases_US/FeatureServer/0/query?f=json&where=(Confirmed%20%3E%200)%20AND%20(1%3D1)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=OBJECTID%20ASC&resultOffset=0&resultRecordCount=4000&cacheHint=true&quantizationParameters=%7B%22mode%22%3A%22edit%22%7D"
   curl -o covidlatest.json "$URLNewCasesJHU"
   cat covidlatest.json | jq -c " .features  | .[] | .attributes" > covidlatest-nl.json
   node loadJsonFromGCS.js
   # Dont' do this, takes forever, and it's 200M data per run
   # node BigQuery.js -t my_dataset.Covid-cases-all > covid-all.json
   # download the last day, validated on bigtable side.
   # in the future we  might replace the following 3 days with the direct download to
   # see if it works better.
   node BigQuery.js -q 'select county_fips_code as fips, FORMAT_DATE("%F", date) as date , county, state_name as state, confirmed_cases as cases, deaths from  `my_dataset.ESRI-Covid-Lastday`'  > last.json
   npx csvtojson covid-19-data/us-counties.csv |jq '[.[] |  .cases = (.cases |(if . == "" then 0 else (.|tonumber) end) ) |.deaths = (.deaths|(if . == "" then 0 else (.|tonumber) end) )]' > nytimes-us-counties.json
   jq -s add last.json nytimes-us-counties.json  > covid-all.json

   datasplit covid-all.json fips $target_dir/
}

getLatestCovidData
getCountySummary
getCDCCountyTesting
getTestingData
getHospitalization
