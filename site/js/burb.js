let reqForm = document.querySelector('#req-form');
let methodSelect = document.querySelector('#method');
let headerSwitch = document.querySelector('#headers-switch');
let headersArea = document.querySelector('#headers');
let bodyArea = document.querySelector('#body');
let responseArea = document.querySelector('#response');

const templateResp = document.querySelector('#template-resp');
const templateRespImg = document.querySelector('#template-resp-img');
const templateRespErr = document.querySelector('#template-resp-err');

async function fetchUrl(event) {
    event.preventDefault();

    let reqData = new FormData(reqForm);
    let options = buildRequestOpts(reqData);
    console.log(options);
    
    try {
        let resp = await fetch(reqData.get('url'), options);
        if(!resp.ok) throw new Error(`${resp.status}: Network response was not ok`);

        parseResponse(resp);
    } catch(e) {
        console.error(`Unable to fetch '${reqData.get('url')}'`, e);
        displayError(e);
    }
}

/**
 * Parses the response according to its content-type and displays the result
 * inside the Response Area element.
 * @param {*} response 
 */
async function parseResponse(response) {
    let parsed, respEl;
    let contentType = response.headers.get('content-type')?.toLowerCase();

    if(!contentType) {
        const headerErr = new Error('Response header content-type missing');
        console.error(headerErr);
        displayError(headerErr);
        return;
    }

    console.log(`response content-type: ${contentType}`);

    responseArea.innerHTML = ''; // Clear any previous content

    if(contentType.includes('json')) {
        parsed = await response.json();
        respEl = templateResp.content.firstElementChild.cloneNode(true);
        respEl.textContent = JSON.stringify(parsed, null, '\t');
    } else if(contentType.includes('image')) {
        parsed = await response.blob();
        respEl = templateRespImg.content.firstElementChild.cloneNode(true);
        respEl.src = URL.createObjectURL(parsed);
    } else {
        parsed = await response.text(); 
        respEl = templateResp.content.firstElementChild.cloneNode(true);
        respEl.textContent = parsed;
    }

    responseArea.appendChild(respEl);
    console.log(parsed);
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
 * Displays the error message in the response area.
 * @param {Error} err 
 */
function displayError(err) {
    responseArea.innerHTML = ''; // Clear any previous content

    let errorEl = templateRespErr.content.firstElementChild.cloneNode(true);
    errorEl.textContent = err.message;
    responseArea.appendChild(errorEl);
}

/**
 * Updates the request options ui based on the current selections.
 */
function updateOptState() {
    headersArea.disabled = !headerSwitch.checked;
    bodyArea.disabled = methodSelect.value === 'GET' || headersArea.disabled;
    bodyArea.placeholder = bodyArea.disabled ? 'Headers must be enabled': '';
}

function init() {
    updateOptState();
    
    // Set the default text for the header options
    headersArea.textContent = '{\n\t"Content-type": "application/json; charset=UTF-8"\n}';

    headerSwitch.addEventListener('change', updateOptState);
    methodSelect.addEventListener('change', updateOptState);
    reqForm.addEventListener('submit', fetchUrl);
}

init();