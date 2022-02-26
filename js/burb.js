let reqForm = document.getElementById('req-form');
let methodSelect = document.getElementById('method');
let headersArea = document.getElementById('headers');

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
    let opts = {
        method: data.get('method'),
        mode: data.get('mode'),
        cache: data.get('cache'),
        credentials: data.get('credentials'),
        redirect: data.get('redirect'),
        referrerPolicy: data.get('referrer-policy')
    };

    if(data.has('headers')) {
        opts.headers = JSON.parse(data.get('headers'));
    }

    return opts;
}

// Set the default text for the header options
headersArea.textContent = '{\n\t"Content-type": "application/json; charset=UTF-8"\n}';

methodSelect.addEventListener('change', event => {
    // Disable the headers area when using a 'get' request
    headersArea.disabled = event.target.value === 'GET';
});

reqForm.addEventListener('submit', fetchUrl);