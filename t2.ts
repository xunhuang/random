const cheerio = require('cheerio');
import * as CloudDB from './CloudDB';

const Storage = CloudDB.getStorageRef();
var ref = Storage.child('abc/text.text');
const fetch = require("node-fetch");

fetch("https://www.bloomberg.com/graphics/covid-vaccine-tracker-global-distribution/", {
    "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
        "sec-ch-ua": "\"Chromium\";v=\"88\", \"Google Chrome\";v=\"88\", \";Not A Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "__sppvid=bb06b3a0-a11e-4765-b068-05c3f32454f5; _sp_krux=false; _sp_v1_uid=1:843:b025e039-1c03-4f91-833a-e6c4005be4c2; _sp_v1_ss=1:H4sIAAAAAAAAAItWqo5RKimOUbLKK83J0YlRSkVil4AlqmtrlXQGQlksAJ3zQ2mdAAAA; _sp_v1_opt=1:; _sp_v1_csv=null; _sp_v1_lt=1:; bb_geo_info={\"country\":\"US\",\"region\":\"US\",\"cityId\":\"5322737\",\"provinceId\":\"5332921\",\"fieldP\":\"E99B51\",\"fieldD\":\"sbcglobal.net\",\"fieldMI\":8,\"fieldN\":\"hf\"}|1613091508850; agent_id=fec0a1b7-172a-4005-9251-b0fb7b0ddc32; session_id=f7109919-4e85-49d0-a6a7-6cb869a5b4d9; session_key=4efbd7a8875a7b9fb34ac1d37596e6485bbd5709; ccpaUUID=c1923025-5956-4197-9033-3c0ae3c3ec7a; dnsDisplayed=true; ccpaApplies=true; signedLspa=false; bbgconsentstring=req1fun1pad1; _gcl_au=1.1.2013272091.1612486711; bdfpc=004.0277686631.1612486710997; _pxvid=438ba445-674d-11eb-aab1-0242ac120004; _rdt_uuid=1612486711806.a58b78e3-d032-435d-adf0-ca3632db6628; _ga=GA1.2.450983673.1612486712; _scid=fdedf278-f27b-482e-a05e-5e5c9ed75f4a; _fbp=fb.1.1612486712802.1665146744; _lc2_fpi=b1166d620485--01exqv57jtrd6p165qpytv0nw9; _sctr=1|1612425600000; _cc_id=536a62b7b899d23d2b54be6bb948584c; __gads=ID=244beab2e6ede8a4:T=1612486713:S=ALNI_MaYPuAZUX9MVwxQ9ELvogUvAA-rNw; _reg-csrf=s%3AGWogLMH79bf-AkRJ4NZmmpru.d86qnYlNQxSCOD67wuvhDpsxFY4WBXnXjmEQRRuhok4; _reg-csrf-token=0M6zfrpT-knLKBc5VQNAuxdAFGbsUMMkfcms; _user-status=anonymous; _last-refresh=2021-2-10%204%3A50; _gid=GA1.2.244472588.1612932659; _parsely_session={%22sid%22:2%2C%22surl%22:%22https://www.bloomberg.com/graphics/covid-vaccine-tracker-global-distribution/%22%2C%22sref%22:%22%22%2C%22sts%22:1612932659365%2C%22slts%22:1612486712685}; _parsely_visitor={%22id%22:%22pid=867259031750883e3ed65e231bf6aa33%22%2C%22session_count%22:2%2C%22last_session_ts%22:1612932659365}; _li_dcdm_c=.bloomberg.com; _sp_v1_data=2:277404:1612486707:0:4:0:4:0:0:_:-1; consentUUID=19023525-b13b-46b9-8726-69059a7720bd; _uetsid=916657806b5b11eb8bce4378198f9ade; _uetvid=441a0bc0674d11eb8ef67fe0c10922ec; _pxff_fp=1; _px2=eyJ1IjoiN2U2YjMzMTAtNmI1Yy0xMWViLWI3ZDAtNmZlZjk0OTVhZTFlIiwidiI6IjQzOGJhNDQ1LTY3NGQtMTFlYi1hYWIxLTAyNDJhYzEyMDAwNCIsInQiOjE2MTI5MzUyNjY5MjQsImgiOiIyN2YxNmNiYmNhYWNiMzhjMzMzYTE2OWY2Y2Y1ODdhNmU5ZTRjZjI2YWQ0OGMyNGQzMmQxYThmNGI4OWFmMjQ1In0=; _px3=a1131106728b5362cb51a858000701d281c02a389768e177e5333aa2bc9631f3:proGCOE+4p8xhWZFJJG3fbgoL0tzK1E4OIjQtYq+fLGZORppyZUiP8jI0jHkmqQWCegNYTKksHKS/vfFEcqEAw==:1000:KHrdRrCTkrjUUTsK5F2vj2kL3seL5vqfWs6VeLF6Ycjy+CWlGLTWn+QveXOY4qOF2/7ckrU1ona3embIbaWHTfLpiiP2SNkc5zwjqMLTZhZgrOtAHLUGeSGWcvWCVCQqqU1eRla90ckQAKkN1w2xqIbv98TNuFVXgSRANpQhEPs=; _pxde=485a6ecc4eff0045263dabc8205e0c1cece1b2a9d32a48a9be73f33198e8ccc3:eyJ0aW1lc3RhbXAiOjE2MTI5MzQ5Njc2OTYsImZfa2IiOjAsImlwY19pZCI6W119"
    },
    "referrer": "https://www.bloomberg.com/tosv2.html?vid=438ba445-674d-11eb-aab1-0242ac120004&uuid=7e6b3310-6b5c-11eb-b7d0-6fef9495ae1e&url=L2dyYXBoaWNzL2NvdmlkLXZhY2NpbmUtdHJhY2tlci1nbG9iYWwtZGlzdHJpYnV0aW9uLw==",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors"
}).then(res => res.text()).then(x => console.log(x));
