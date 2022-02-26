let reqForm = document.getElementById('req-form');

async function fetchUrl(event) {
    event.preventDefault();

    let reqData = new FormData(reqForm);
    let options = {};
    
    try {
        let resp = await fetch(reqData.get('url'), options);
        let respJson = await resp.json();
        console.log(respJson);
    } catch(e) {
        console.error(`Unable to fetch ${reqUrl}`, e);
    }
}

reqForm.addEventListener('submit', fetchUrl)