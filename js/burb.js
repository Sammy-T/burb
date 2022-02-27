let reqForm = document.querySelector('#req-form');
let methodSelect = document.querySelector('#method');
let headerSwitch = document.querySelector('#headers-switch');
let headersArea = document.querySelector('#headers');
let bodyArea = document.querySelector('#body');
let responseArea = document.querySelector('#response');

async function fetchUrl(event) {
    event.preventDefault();

    let reqData = new FormData(reqForm);
    let options = buildRequestOpts(reqData);
    console.log(options);
    
    try {
        let resp = await fetch(reqData.get('url'), options);
        let respText = await resp.text();
        
        responseArea.textContent = respText;
    } catch(e) {
        let errorMsg = `Unable to fetch ${reqData.get('url')}`;

        console.error(errorMsg, e);
        responseArea.textContent = errorMsg;
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

    if(data.has('headers')) opts.headers = JSON.parse(data.get('headers'));
    if(data.has('body')) opts.body = data.get('body');

    return opts;
}

/**
 * Updates the request options ui based on the current selections.
 */
function updateOptState() {
    headersArea.disabled = !headerSwitch.checked;
    bodyArea.disabled = methodSelect.value === 'GET' || headersArea.disabled;
}

// Set the default text for the header options
headersArea.textContent = '{\n\t"Content-type": "application/json; charset=UTF-8"\n}';

headerSwitch.addEventListener('change', updateOptState);
methodSelect.addEventListener('change', updateOptState);
reqForm.addEventListener('submit', fetchUrl);