let reqForm = document.getElementById('req-form');

async function fetchUrl(event) {
    event.preventDefault();

    let reqData = new FormData(reqForm);
    let options = buildRequestOpts(reqData);
    console.log(options);
    
    try {
        let resp = await fetch(reqData.get('url'), options);
        let respJson = await resp.json();
        console.log(respJson);
    } catch(e) {
        console.error(`Unable to fetch ${reqUrl}`, e);
    }
}

/**
 * Builds and returns a fetch() options object using the provided FormData.
 * @param {FormData} data 
 * @returns {Object} An object containing fetch options
 */
function buildRequestOpts(data) {
    return {
        method: data.get('method'),
        mode: data.get('mode'),
        cache: data.get('cache'),
        credentials: data.get('credentials'),
        redirect: data.get('redirect'),
        referrerPolicy: data.get('referrer-policy')
    };
}

reqForm.addEventListener('submit', fetchUrl)