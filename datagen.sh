
datasplit() {
    filetosplit=$1
    attr=$2
    outputfile_prefix=$3
    jq_params="group_by(.$attr) | .[] | .[0].$attr as \$k | \"\(\$k)\t\(.)\" "
    awk_params='{fname="'$outputfile_prefix'"$1".json"; print $2> fname;close(fname)}'
    cat $filetosplit | jq -cr "$jq_params" | awk -F\\t "$awk_params"
}

# cat website/build/data/testing/states.json | jq -cr 'group_by(.fips) | .[] | .[0].fips as $k | "\($k)\t\(.)" ' | awk -F\\t '{fname="website"$1".json"; print $2> fname;close(fname)}'
testing_dir='website/build/data/testing'
mkdir -p testing_dir
f=`curl -s -L https://healthdata.gov/dataset/covid-19-diagnostic-laboratory-testing-pcr-testing-time-series.xml | xmlstarlet sel -t -v "/rdf:RDF/dcat:Distribution/dcat:downloadURL/@rdf:resource"` ; echo $f; curl -s $f | npx csvtojson | jq -f website/state.jq > $testing_dir
datasplit $testing_dir/states.json state $testing_dir/