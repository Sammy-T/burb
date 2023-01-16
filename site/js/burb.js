const reqForm = document.querySelector('#req-form');
const methodSelect = document.querySelector('#method');
const urlInput = document.querySelector('#req-form input[name=url]');
const editUrlBtn = document.querySelector('#edit-url');
const headerSwitch = document.querySelector('#headers-switch');
const headersArea = document.querySelector('#headers');
const bodyArea = document.querySelector('#body');
const responseArea = document.querySelector('#response');

const modalEditUrl = document.querySelector('#edit-url-modal');

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
        let headersStr = 'Headers {';
        for(let entry of response.headers.entries()) {
            headersStr +=  `\n${entry.join(': ')}`;
        }
        headersStr += ' }';

        const headerWarning = 'Unknown response: Header \'content-type\' missing';
        console.warn(`${headerWarning}\n${headersStr}`);
    }

    console.log(`response content-type: ${contentType}`);

    responseArea.innerHTML = ''; // Clear any previous content

    if(contentType?.includes('json')) {
        parsed = await response.json();
        respEl = templateResp.content.firstElementChild.cloneNode(true);
        respEl.textContent = JSON.stringify(parsed, null, '\t');
    } else if(contentType?.includes('image')) {
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
 * Displays the 'edit url' modal and 
 * sets up the ui according to the main form's request url.
 */
function displayEditUrlModal() {
    // Clear any previous param elements
    const prevEls = modalEditUrl.querySelectorAll('.param');
    prevEls.forEach(el => el.remove());

    const paramField = modalEditUrl.querySelector('#param-field');
    const templateParam = document.querySelector('#template-param');

    function addParamEl() {
        const paramEl = templateParam.content.firstElementChild.cloneNode(true);
        paramField.appendChild(paramEl);
        return paramEl;
    }

    // Add a param element when clicked
    modalEditUrl.querySelector('#add-param').onclick = event => {
        event.preventDefault();
        addParamEl();
    };

    const reqUrl = reqForm.querySelector('input[type="url"]');
    const modalUrl = modalEditUrl.querySelector('input[type="url"]');

    const url = (reqUrl.value !== '') ? new URL(reqUrl.value) : null;
    console.log(url);

    // Set the modal url
    modalUrl.value = (url) ? `${url.origin}${url.pathname}` : '';

    // Build the param elements
    if(url?.searchParams.toString()) {
        for(const [key, value] of url.searchParams) {
            const paramInputs = addParamEl().querySelectorAll('input');
            paramInputs[0].value = key;
            paramInputs[1].value = value;
        }
    } else {
        addParamEl();
    }

    modalEditUrl.setAttribute('open', ''); // Display the modal
}

/**
 * Reads the values set in the 'edit url' modal,
 * builds the new url, and sets the value
 * of the main form's url input.
 */
function processUrlEdits() {
    const reqUrl = reqForm.querySelector('input[type="url"]');
    const modalUrl = modalEditUrl.querySelector('input[type="url"]');
    const paramEls = modalEditUrl.querySelectorAll('.param');

    const params = new URLSearchParams();

    // Read the params
    paramEls.forEach(el => {
        const paramInputs = el.querySelectorAll('input');
        const [key, value] = [paramInputs[0].value, paramInputs[1].value];
        if(key !== '') params.append(key, value);
    });

    // Build the url and set main form's url input value
    let url = modalUrl.value;
    if(params.toString().length > 0) url += `?${params.toString()}`;

    reqUrl.value = url;
}

/**
 * Checks the url input for a protocol. If one isn't found, adds a 'https://' protocol 
 * to the url input value. The form will not submit without a protocol in the url.
 */
function checkUrlProtocol() {
    const url = urlInput.value.trim();

    if(url === '') return; // Ignore empty input

    // Check if the url has a protocol and return early if one is found
    const protocolRe = /^[a-z]+:\/\//;
    if(protocolRe.test(url)) return;

    // Add the 'https://' protocol to the input value
    urlInput.value = `https://${url}`;
}

/**
 * Updates the request options ui based on the current selections.
 */
function updateOptState() {
    headersArea.disabled = !headerSwitch.checked;
    bodyArea.disabled = methodSelect.value === 'GET' || headersArea.disabled;
    bodyArea.placeholder = bodyArea.disabled ? 'Headers must be enabled': '';
}

function initModals() {
    const modals = document.querySelectorAll('dialog');

    function hideModals() {
        modals.forEach(m => m.removeAttribute('open'));
    }

    // Display the 'edit url' modal when clicked
    editUrlBtn.addEventListener('click', event => {
        event.preventDefault();
        displayEditUrlModal();
    });

    // Hide modal(s) when the modal background or cancel button is clicked
    modals.forEach(modal => {
        modal.addEventListener('click', event => {
            if(event.target.tagName.toLowerCase() !== 'dialog') return;
            hideModals();
        });
    });

    const cancelBtns = document.querySelectorAll('a[href="#cancel"]');
    cancelBtns.forEach(cancelBtn => {
        cancelBtn.addEventListener('click', event => {
            event.preventDefault();
            hideModals();
        });
    });

    // Set up the confirm action(s)
    const confirmBtns = document.querySelectorAll('a[href="#confirm"]');
    confirmBtns.forEach(confirmBtn => {
        confirmBtn.addEventListener('click', event => {
            event.preventDefault();
            
            // If the clicked 'confirm' button is a descendant of 
            // the 'edit url' modal, process the url edits
            if(modalEditUrl.contains(event.target)) {
                processUrlEdits();
            }

            hideModals();
        });
    });
}

function init() {
    updateOptState();
    initModals();
    
    // Set the default text for the header options
    headersArea.textContent = '{\n\t"Content-type": "application/json; charset=UTF-8"\n}';

    urlInput.addEventListener('keydown', (event) => {if(event.key === 'Enter') checkUrlProtocol()});
    urlInput.addEventListener('focusout', checkUrlProtocol);
    headerSwitch.addEventListener('change', updateOptState);
    methodSelect.addEventListener('change', updateOptState);
    reqForm.addEventListener('submit', fetchUrl);
}

init();