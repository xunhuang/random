
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

   jq -c '.[]' $target_dir/USA.json > tmp/us-testing.json
   jq -c '.[]' $target_dir/states.json > tmp/states-testing.json

   node ts-out/loadJsonFromGCS.js my_dataset us-testing tmp/us-testing.json
   node ts-out/loadJsonFromGCS.js my_dataset states-testing tmp/states-testing.json
}

getHospitalization() {
   echo "fetching hospitalization data from Health Data.gov"
   target_dir='website/build/data/hospitalization'
   mkdir -p $target_dir
   # data for timeseries seems to have stalled since 3/20/2021
   # non-timeseries version is here
   # https://healthdata.gov/dataset/COVID-19-Reported-Patient-Impact-and-Hospital-Capa/4cnb-m4rz
   f=`curl -L -S https://healthdata.gov/resource/qqte-vkut.json  |jq -r ' .[-1] |.archive_link | .url'`
   curl -s $f | npx csvtojson  > $target_dir/states-original.json
   jq -f website/hospitalization.jq  $target_dir/states-original.json > $target_dir/states.json
   datasplit $target_dir/states.json state $target_dir/
   cat $target_dir/states.json  | jq -f website/hospitalizationUSSummarize.jq  > $target_dir/USA.json

   jq -c '.[]' $target_dir/states.json > tmp/states-hospitalization.json
   jq -c '.[]' $target_dir/USA.json > tmp/us-hospitalization.json
   node ts-out/loadJsonFromGCS.js my_dataset us-hospitalization tmp/us-hospitalization.json
   node ts-out/loadJsonFromGCS.js my_dataset states-hospitalization tmp/states-hospitalization.json
}

getCDCCountyTesting() {
   echo "fetching CDC County Data"
   target_dir='website/build/data/testing'
   mkdir -p $target_dir
   node ts-out/BigQuery.js -t my_dataset.CDC-county-test-all > $target_dir/cdc-county-testing-all.json
   node ts-out/BigQuery.js -t my_dataset.CDC-county-test-latest > $target_dir/cdc-county-testing-latest.json
}

getCountySummary() {
   echo "fetching County Summary Data"
   target_dir='website/build/data/county'
   mkdir -p $target_dir
   node ts-out/BigQuery.js -t my_dataset.covid-19-county-official-view > $target_dir/county-all.json
   datasplit $target_dir/county-all.json county_fips_code $target_dir/
}

getLatestCovidData() {
   target_dir='website/build/data/county-details'
   mkdir -p $target_dir
   URLNewCasesJHU="https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases_US/FeatureServer/0/query?f=json&where=(Confirmed%20%3E%200)%20AND%20(1%3D1)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=OBJECTID%20ASC&resultOffset=0&resultRecordCount=4000&cacheHint=true&quantizationParameters=%7B%22mode%22%3A%22edit%22%7D"
   curl -o covidlatest.json "$URLNewCasesJHU"
   cat covidlatest.json | jq -c " .features  | .[] | .attributes" > covidlatest-nl.json
   node ts-out/loadJsonFromGCS.js  my_dataset ESRI_imported_raw covidlatest-nl.json covidlatest.schema.json
   node ts-out/BigQuery.js -q 'select county_fips_code as fips, FORMAT_DATE("%F", date) as date , county, state_name as state, confirmed_cases as cases, deaths from `official.county-cases-all`' > covid-all.json
   datasplit covid-all.json fips $target_dir/
}

getCACountyVaccineData() {
   target_dir='website/build/data/vaccine/counties'
   mkdir -p $target_dir
   node ts-out/BigQuery.js -q 'select FORMAT_DATE("%F", date) as date, * except(date) from `official.CA-County-Vaccines-overtime`' > $target_dir/CA.json
   datasplit $target_dir/CA.json fips $target_dir/
}

getCDCStateLevelVaccine() {
   target_dir="website/build/data/vaccine"
   mkdir -p $target_dir
   node ts-out/BigQuery.js -q 'select distinct FORMAT_DATE("%F", date) as date, Location as state, Doses_Administered, Doses_Distributed FROM `myrandomwatch-b4b41.my_dataset.CDC-Vaccine-Overtime-Table`' > $target_dir/states.json
   datasplit $target_dir/states.json state $target_dir/
}

mkdir -p tmp
getLatestCovidData
getCountySummary
getCDCCountyTesting
getTestingData
getHospitalization
getCACountyVaccineData
getCDCStateLevelVaccine