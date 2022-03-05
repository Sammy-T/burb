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
        if(!resp.ok) throw new Error(`${resp.status}: Network response was not ok`);

        parseResponse(resp);
    } catch(e) {
        console.error(`Unable to fetch '${reqData.get('url')}'`, e);

        responseArea.innerHTML = ''; // Clear any previous content
        responseArea.appendChild(document.createElement('p'));
        responseArea.querySelector('p').textContent = e.message;
    }
}

/**
 * Parses the response according to its content-type and displays the result
 * inside the Response Area element.
 * @param {*} response 
 */
async function parseResponse(response) {
    let parsed;
    let contentType = response.headers.get('content-type').toLowerCase();
    console.log(`response content-type: ${contentType}`);

    responseArea.innerHTML = ''; // Clear any previous content

    if(contentType.includes('json')) {
        parsed = await response.json();
        responseArea.appendChild(document.createElement('p'));
        responseArea.querySelector('p').textContent = JSON.stringify(parsed, null, '\t');
    } else if(contentType.includes('image')) {
        parsed = await response.blob();
        responseArea.appendChild(document.createElement('img'));
        responseArea.querySelector('img').src = URL.createObjectURL(parsed);
    } else {
        parsed = await response.text(); 
        responseArea.appendChild(document.createElement('p'));
        responseArea.querySelector('p').textContent = parsed;
    }

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