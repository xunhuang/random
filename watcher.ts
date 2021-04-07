const superagent = require('superagent');

import * as Email from './website/src/Email';
import { Subscription, WebPageContent, processSubscription } from './Ingest';

const NewSubscriptions = [
    new Subscription(
        "Walgreens san mateo",
        "n/a",
        ["xhuang@gmail.com"],
        {
            contentType: "json",
            curlCmd: `curl -s 'https://www.walgreens.com/hcschedulersvc/svc/v1/immunizationLocations/availability'   -H 'authority: www.walgreens.com'   -H 'sec-ch-ua: "Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"'   -H 'accept: application/json, text/plain, */*'   -H 'x-xsrf-token: Ms3qNRjtX8wzdQ==.ZMAqa561Hv401ryakx4jqqFkBQlqkr61Ug99DN0nDJE='   -H 'sec-ch-ua-mobile: ?0'   -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36'   -H 'content-type: application/json; charset=UTF-8'   -H 'origin: https://www.walgreens.com'   -H 'sec-fetch-site: same-origin'   -H 'sec-fetch-mode: cors'   -H 'sec-fetch-dest: empty'   -H 'referer: https://www.walgreens.com/findcare/vaccination/covid-19/location-screening'   -H 'accept-language: en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7'   -H 'cookie: XSRF-TOKEN=u2CEPu+rivvhwQ==.VYV3Wgw76My7DHT9fYV6VdtBGp3Wb97VJxhX2h36jcg=; dtCookie=5$4B9D9EC4782B649F80597908CD41F923|0eed2717dafcc06d|1; bm_sz=DDA34D41CD054A58D9B081195363C150~YAAQeukyFxb1Pnd4AQAAAsHUpQtNK0kT60zgAmWLNBHwwJJdMG0EhPX0l/v0nxEbKw7OagTCiOBOwoUhxZ24orWeA/4PZcmYrA9LADdTLtdaKWcsUi5ftH6igksIR1uvmo7uFvIx0Vi6Un5t1KY1sQlnbTNAnbDXd1Bqt8Ty5l6zf1KXXa1UQ1hWgCCT2gcxNVir; rxVisitor=1617689887390MGFHMTRBBNEA0K1HPNS5RP0S93R7GRQA; wag_sid=rkai5n3z68tsf014wsplvhj2; uts=1617689889147; AMCVS_5E16123F5245B2970A490D45%40AdobeOrg=1; AMCV_5E16123F5245B2970A490D45%40AdobeOrg=-1124106680%7CMCIDTS%7C18724%7CMCMID%7C09052486478526493204307053357128591345%7CMCAAMLH-1618294690%7C9%7CMCAAMB-1618294690%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1617697090s%7CNONE%7CvVersion%7C5.2.0; ak_bmsc=8DD215B978969D36DA386D4EA30758211732E97A6A0900001EFD6B609765E248~plT2CZVBCFOqwUQ9Csc55oetda4Bsq4QQ1B/ENS3Rx/RdXxMO5XuL6MLYC0zr36gqwISlS6hxwX+/WAE3XlzhZfgQ5cxcFAl8f+Fwyzfq9Uz+WTmZpeyl8z2ydhgU5VQGlhC/D2nwMhqZoQYN1Jj1sJiGpOEMcq/84C7J2TorGH6leVlgnpZu7RZSHKwx1QfOzaAqdPaITge7lC1w9P7ERdVkZk6Jq9LK+nOKYDmK8XwELwqbRj+ddMFARrLzJScYr; s_cc=true; _gcl_au=1.1.1716420556.1617689891; strOfrId={"WAStrId":"3296","WAStrSt":"191 E 3RD AVE"}; str_nbr_do=3296; UGL=%7B%22LSrZp%22%3A%2294401%22%2C%22pdStrId%22%3A%223296%22%2C%22pdStrIdZp%22%3A%2294401%22%2C%22pdStrIdSt%22%3A%22191%20E%203RD%20AVE%22%7D; session_id=2d59fa0a-cb3b-41c5-aef5-496f15ed2bdd; IM_throttle_1223=off; mt.v=2.837960999.1617689899696; at_check=true; fc_vnum=1; fc_vexp=true; gRxAlDis=N; USER_LOC=2%2BsKJSc9HtLj%2BvupoOGO1zufCKUgUi6AVXmP15NSi0NBfBetdGRYxqdNn5Kt3i%2FG; mt.sc=%7B%22i%22%3A1617691895341%2C%22d%22%3A%5B%5D%7D; mbox=PC#269df503882e426e860b15c04f717f4e.35_0#1680936700|session#8329211f7ce0400283a240228935ea7b#1617693759; mt.mbsh=%7B%22fs%22%3A1617691901379%7D; gpv_Page=https%3A%2F%2Fwww.walgreens.com%2Ffindcare%2Fvaccination%2Fcovid-19%2Flocation-screening; dtSa=-; bm_sv=7D961F3B77609A107CAADFB965EA3095~RoVdjRH/TpIA9CcBvXs4DplEapuK6VEJso0xTPWucmDzExEHiaUv+KfOIViAYwOa0Zi2YMr7IrwynYk495SoVaLKKXVO37ZKY9IrHtciHDLlPPGTxKfyG12oLfwkStoTPCp8WlfiXCJBtcWMkC6nwutqaavo8V9k6jfpw+Te0TI=; _abck=7658CF0DA34E0E3EBD5BC2AB56237E5E~0~YAAQPOkyF+EIYXd4AQAAfcP4pQW+lqMAlmN9ESxDC7EwfGTGvZog4IzJy5NB7ZkoFGccb/n35cb5HJ81iFuf6tP/y1Rx5JfJ2CtrqDHxbcu+noU1xKjHRNBD5XRMY12rwqPtoTWyskga26oDvHD3uUfWbLfWLsFbyiY7dxOyxhVozVYe7+JYGmRC4jNE0ooP31RCtqwUjK++ex30kveqt0ccIoJfvKSo0yXXREGLMBxssBzh+n4N7aCenRbaAXyrJ4ByAWBZtmg4SVO+b4SlFNRQhh9sTpWO0/JypDJpjiD+3V1wwrQjxxhwxrHEs0OYUm9/ZcqsSKJpcLrFdOn2Fkz21zUNA5NgerzC1GaBUnZgoOV5UgQfaFW6VL769hN1kTKjo4mn/EC0nmfWGRrjA4PrdVOncXc+wP+V~-1~||-1||~-1; rxvt=1617694048187|1617689887394; dtPC=5$92243119_490h-vDOWGCPWFNCVCKCPLMFGOKAVBCUGHRJKB-0e32; akavpau_walgreens=1617692554~id=ad3bf318b5315a18f69bc38cc72bb536; dtLatC=2; s_sq=walgrns%3D%2526c.%2526a.%2526activitymap.%2526page%253Dwg%25253Afindcare%25253Acovid19%252520vaccination%25253Alocation%25253Ascreening%2526link%253DSearch%2526region%253Dwag-body-main-container%2526pageIDType%253D1%2526.activitymap%2526.a%2526.c%2526pid%253Dwg%25253Afindcare%25253Acovid19%252520vaccination%25253Alocation%25253Ascreening%2526pidt%253D1%2526oid%253DSearch%2526oidt%253D3%2526ot%253DSUBMIT'   --data-raw '{"serviceId":"99","position":{"latitude":37.5793536,"longitude":-122.3164207},"appointmentAvailability":{"startDateTime":"2021-04-08"},"radius":25}'   --compressed `,
        }
    ),
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

doit().then(() => {
    console.log("all done with watcher")
    process.exit();
});