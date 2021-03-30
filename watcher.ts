const superagent = require('superagent');

import * as Email from './website/src/Email';
import { Subscription, WebPageContent, processSubscription } from './Ingest';

const NewSubscriptions = [
    new Subscription(
        "JHU Current Realtime Cases data",
        "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases_US/FeatureServer/0/query?f=json&where=(Confirmed%20%3E%200)%20AND%20(1%3D1)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=OBJECTID%20ASC&resultOffset=0&resultRecordCount=4000&cacheHint=true&quantizationParameters=%7B%22mode%22%3A%22edit%22%7D",
        ["xhuang@gmail.com"],
        {
            storageTableName: "JHU-ESRI-Realtime2",
            jqQuery: "[.features  | .[] | .attributes]",
            contentType: "json",
        }
    ),
    new Subscription(
        "LA Times Vaccine Info",
        "https://www.latimes.com/projects/california-coronavirus-cases-tracking-outbreak/covid-19-vaccines-distribution/",
        ["xhuang@gmail.com"],
        {
            storageTableName: "California-Vaccine-2"
        }
    ),
    new Subscription(
        "NYS Covid Watcher",
        "https://am-i-eligible.covid19vaccine.health.ny.gov/api/list-providers",
        [],
        {
            contentType: "json",
            jqQuery: ".providerList",
            storageTableName: "NYC-Vaccines-New",
        }
    ),
    new Subscription(
        "CDC County Data",
        "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=integrated_county_latest_external_data",
        ["xhuang@gmail.com"],
        {
            storageTableName: "CDC-County-Data"
        }
    ),
    new Subscription(
        "CDC State Testing Data",
        "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=US_MAP_TESTING",
        ["xhuang@gmail.com"],
        {
            storageTableName: "CDC-State-Testing-Data"
        }
    ),
    new Subscription(
        "CDC State Vaccination Data",
        "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_data",
        [],
        {
            storageTableName: "CDC-State-Vaccination-Data"
        }
    ),
    new Subscription(
        "CDC National Vaccination Trends",
        "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_trends_data",
        [],
        {
            storageTableName: "CDC-National-Vaccination-Trends"
        }
    ),
    new Subscription(
        "CDC Vaccination Demographic",
        "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_demographics_data",
        [],
        {
            storageTableName: "CDC-Vaccination-Demographic"
        }
    ),
];

async function doit() {
    let subs = NewSubscriptions;
    // subs = NewSubscriptions.slice(0, 1); // first item
    // subs = NewSubscriptions.slice(-1); // last item

    let errors = [];
    for (let i = 0; i < subs.length; i++) {
        let sub = subs[i];
        try {
            console.log(sub);
            await processSubscription(sub);
        } catch (err) {
            if (!sub.ignoreErrors) {
                errors.push({
                    name: sub.displayName,
                    error: err.toString(),
                })
            }
            console.log(err);
            console.log("Error but soldier on....");
        }

    }
    if (errors.length > 0) {
        await Email.send(
            ["xhuang@gmail.com"],
            `${errors.length} from latest run`,
            JSON.stringify(errors, null, 2)
        );
    }
}

doit().then(() => process.exit());