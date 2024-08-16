import { initViewer, loadModel, getAccessToken } from './viewer.js';

let viewer1;



initViewer(document.getElementById('preview')).then(viewer => {
    viewer1 = viewer;

    // console.log(viewer);
    
    const urn = window.location.hash?.substring(1);
    setupModelSelection(viewer, urn);
    setupModelUpload(viewer);
    activateFullscreen(viewer);

    getAccessToken(handleAccessToken);

    const accessToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY0RE9XMnJoOE9tbjNpdk1NU0xlNGQ2VHEwUV9SUzI1NiIsInBpLmF0bSI6ImFzc2MifQ.eyJzY29wZSI6WyJkYXRhOnJlYWQiXSwiY2xpZW50X2lkIjoiSUE0MGtxV09hNUVVU29iWUpORVJPQVFKQWJhNTV0ck1oblhzVWhlYzNKbEtsdGVLIiwiaXNzIjoiaHR0cHM6Ly9kZXZlbG9wZXIuYXBpLmF1dG9kZXNrLmNvbSIsImF1ZCI6Imh0dHBzOi8vYXV0b2Rlc2suY29tIiwianRpIjoiQUpQWkI2cmdyTTVWdXRyZ1VPNkVlaHprZzNnQUFUdWFlcjZXTHB2M1RLZW1MQkwwSlVsTmtXOWhnR1hpTmR0eSIsImV4cCI6MTcyMzA0Mjc4NH0.UIrchXe5q6bfqU7tPwd91kq0-39qmRAUdFyu-g6RGwjE4CA37DOi7BcrOy7-qAXjXSuv0BbIzcGTdlBrf6QFG_St5B_Wox4rltLdwZaVnuIShIAYSFCuQpuRDhn1qRH9qrCHEwVhZgPdFeWtJmwBZCXtAyo2I415FTam0gBvyJb_9tQ2Zt9merOLTrJ3GSzFWu4AW01ayCMCWZg8TmIU68COKeHwTBZitgsAnOriIKznFK0eme6m7OR4PmYFxPDSad8a2chfAAvureDVvZN6kM7g4Qprvs1j0KYZwBoS-sm8ADud2dXYPy1KQJupG79GCWeClWqYOqTNJ0Z3Hr0nhQ';
    const urnOfSourceFile = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aWE0MGtxd29hNWV1c29ieWpuZXJvYXFqYWJhNTV0cm1obnhzdWhlYzNqbGtsdGVrLWJhc2ljLWFwcC9DQUQtMTAyMTctUmV2MDEtQmxlbmRlciUyMDMuMCUyMEFzc2VtYmx5LlNURVA';
    const guidOfViewable = 'aa85aad6-c480-4a35-9cbf-4cf5994a25ba';

    getProperties(accessToken, urnOfSourceFile, guidOfViewable)
    .then(properties => {
        console.log('Properties:', properties);
    })
    .catch(error => {
        console.error('Error:', error);
    });

    

   

   
});


async function setupModelSelection(viewer, selectedUrn) {
    const dropdown = document.getElementById('models');
    dropdown.innerHTML = '';
    try {
        const resp = await fetch('/api/models');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const models = await resp.json();
        dropdown.innerHTML = models.map(model => `<option value=${model.urn} ${model.urn === selectedUrn ? 'selected' : ''}>${model.name}</option>`).join('\n');
        dropdown.onchange = () => onModelSelected(viewer, dropdown.value);
        if (dropdown.value) {
            onModelSelected(viewer, dropdown.value);
        }
    } catch (err) {
        alert('Could not list models. See the console for more details.');
        console.error(err);
    }
}

async function setupModelUpload(viewer) {

    console.log(viewer1);

    const upload = document.getElementById('upload');
    const input = document.getElementById('input');
    const models = document.getElementById('models');
    upload.onclick = () => input.click();
    input.onchange = async () => {
        const file = input.files[0];
        let data = new FormData();
        data.append('model-file', file);
        if (file.name.endsWith('.zip')) { // When uploading a zip file, ask for the main design file in the archive
            const entrypoint = window.prompt('Please enter the filename of the main design inside the archive.');
            data.append('model-zip-entrypoint', entrypoint);
        }
        upload.setAttribute('disabled', 'true');
        models.setAttribute('disabled', 'true');
        showNotification(`Uploading model <em>${file.name}</em>. Do not reload the page.`);
        try {
            const resp = await fetch('/api/models', { method: 'POST', body: data });
            if (!resp.ok) {
                throw new Error(await resp.text());
            }
            const model = await resp.json();
            setupModelSelection(viewer, model.urn);
        } catch (err) {
            alert(`Could not upload model ${file.name}. See the console for more details.`);
            console.error(err);
        } finally {
            clearNotification();
            upload.removeAttribute('disabled');
            models.removeAttribute('disabled');
            input.value = '';
        }
    };
}

async function onModelSelected(viewer, urn) {
    if (window.onModelSelectedTimeout) {
        clearTimeout(window.onModelSelectedTimeout);
        delete window.onModelSelectedTimeout;
    }
    window.location.hash = urn;
    try {
        const resp = await fetch(`/api/models/${urn}/status`);
        console.log(resp);
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const status = await resp.json();

        
        switch (status.status) {
            case 'n/a':
                showNotification(`Model has not been translated.`);
                break;
            case 'inprogress':
                showNotification(`Model is being translated (${status.progress})...`);
                window.onModelSelectedTimeout = setTimeout(onModelSelected, 5000, viewer, urn);
                break;
            case 'failed':
                showNotification(`Translation failed. <ul>${status.messages.map(msg => `<li>${JSON.stringify(msg)}</li>`).join('')}</ul>`);
                break;
            default:
                clearNotification();
                // Assuming 'viewer' and 'urn' are defined elsewhere

loadModel(viewer, urn).then(function (model) {

    console.log(urn);
    // https://developer.api.autodesk.com/modelderivative/v2/regions/eu/designdata/{urn}/metadata/878e6b97-35e9-47b4-8a9c-64b5d3b5376a/properties

    model.getObjectTree(function onSuccessCallback(tree){
        console.log(tree);
    }, function onFailcallback(er){
        console.log(er);
    })

    
    console.log('Model loaded:', model.getDocumentNode());
    


    const accessToken = 'your_access_token';

    const txt1 = "OTS-10018"
    searchAndHighlight(viewer, txt1);

    
    
   
}).catch(function (error) {
    // Handle any errors that occurred during loading
    console.error('Error loading model:', error);
});

                // const model = viewer.model;
                  
        } // end of switch case
    } catch (err) {
        alert('Could not load model. See the console for more details.');
        console.error(err);
    }
}

// functions to procure metadata
function handleAccessToken(accessToken, expiresIn) {
    console.log('Access Token:', accessToken);
    console.log('Expires In (seconds):', expiresIn);

    // You can now use the access token to make API calls
    // For example, call another function that requires the access token
    fetchModelMetadata(accessToken);
}

async function fetchModelMetadata(accessToken) {
    const urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6a3FnbHJmdG9uY29jeXVhcGtpc3M3dGdyYmd3dm14bXRxODRnbnIzeXVqcXhnenB2LWJhc2ljLWFwcC9DQUQtMTAyMTctUmV2MDEtQmxlbmRlciUyMDMuMCUyMEFzc2VtYmx5LlNURVA';
    const modelGuid = 'aa85aad6-c480-4a35-9cbf-4cf5994a25ba';

    // URL encode the urn
    const encodedUrn = encodeURIComponent(urn);
    console.log("Urn safe: ", encodedUrn);

    const acx = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY0RE9XMnJoOE9tbjNpdk1NU0xlNGQ2VHEwUV9SUzI1NiIsInBpLmF0bSI6ImFzc2MifQ.eyJzY29wZSI6WyJkYXRhOndyaXRlIiwiZGF0YTpyZWFkIiwiYnVja2V0OmNyZWF0ZSIsImJ1Y2tldDpkZWxldGUiXSwiY2xpZW50X2lkIjoia3FHbHJmdG9OQ09DeXVBcGtJc1M3VEdyQkdXVm1YTXRxODRnbnIzeVVqUVhnWnB2IiwiaXNzIjoiaHR0cHM6Ly9kZXZlbG9wZXIuYXBpLmF1dG9kZXNrLmNvbSIsImF1ZCI6Imh0dHBzOi8vYXV0b2Rlc2suY29tIiwianRpIjoiekpqQUdGakhxMVA2WnRGU043VlZ6aXE2RTB3MnplUWdNUmlaRDJ3RkVxenZBTzRhZ2tud2paeTB6OXFHS3JRQSIsImV4cCI6MTcyMzA0ODg5Mn0.m8VXMdjmUIRCdt7QYoI6jOnnjZEqmhkg5mftbJ5gUnLTy3zf1UqUgfGhKoAUQDcKzDNZWhTmgFVJklf445OR7AZPwc5NFbcv42hrTpX5rLzT3NcUYZlDNgLY0rW5V2neYTOK1Du_h_s537i5EpJDTgUpXRvlbigmtMhi268ND0CJ29R28PhfNkT0BJnT5Bjvmz6jOw4w5WW7bSO8h-ngJtN2e-vSiW5mLk12pYbMRWmahCLuKRe6uFWSSWngtDyscrR-dg0BG9MGUyUfyZ4S1b5m35le31SOsSdppJi1ZEUXYi1DUeazTAAGaxtgIeJwUOOyj7dzLxZgbsT2JMy2uw";

    const url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/${encodedUrn}/metadata/${modelGuid}`;
    console.log(url);
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Model Metadata:', data);
    } catch (error) {
        console.error('Error fetching model metadata:', error);
    }
}


function getProperties(accessToken, urnOfSourceFile, guidOfViewable) {
    const baseUrl = 'https://developer.api.autodesk.com/modelderivative/v2/designdata/';
    const endpoint = `metadata/${guidOfViewable}/properties`;
    const url = `${baseUrl}${encodeURIComponent(urnOfSourceFile)}/${endpoint}`;

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';

            // A chunk of data has been received.
            res.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            res.on('end', () => {
                resolve(JSON.parse(data));
                console.log(JSON.parse(data));
            });
        });

        // Error handling for the request.
        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function activateFullscreen(viewer) {
    try {
        await viewer.loadExtension('Autodesk.FullScreen');
        const fullscreenExtension = viewer.getExtension('Autodesk.FullScreen');
            const fullscreenButton = document.getElementById('explode');
            fullscreenButton.addEventListener('click', function() {
                fullscreenExtension.activate();
            });
        
    } catch (err) {
        console.error('Failed to load Autodesk.FullScreen extension:', err);
    }
}

function getAllDbIds(viewer) {
    console.log(viewer.model);
}
 

function showNotification(message) {
    const overlay = document.getElementById('overlay');
    overlay.innerHTML = `<div class="notification">${message}</div>`;
    overlay.style.display = 'flex';
}

function clearNotification() {
    const overlay = document.getElementById('overlay');
    overlay.innerHTML = '';
    overlay.style.display = 'none';
}


async function toggleExplode() {
    const togbtn = document.getElementById("explode");
    togbtn.onclick = () =>{
        alert("work");
    }
    
}


function traverseInstanceTree(node) {
    // Print information about the current node
    console.log('Node:', node);
    
    // Recursively traverse child nodes
    const children = node.getChildren();
    children.forEach(child => {
        traverseInstanceTree(child);
    });
}

function searchAndHighlight(viewer, searchText) {
    console.log(searchText);
    viewer.search(searchText, function(results) {
        if (results && results.length > 0) {
            var part = results[0]; // Take the first result
            var dbId = part.dbId; // Extract the dbId

            console.log(results);
            console.log(viewer.constructor.name); // Should print 'GuiViewer3D'
            console.log(dbId, " ", part); // Should be 'function'



            // Highlight the part
            if (viewer instanceof Autodesk.Viewing.GuiViewer3D) {
                var dbIdArray = results;
        viewer.isolate(dbIdArray); // Optionally isolate the part
        // viewer.select(results);
        

        
            } else {
                console.error('Viewer instance is not valid.');
            }

            
        } else {
            console.log('No parts found');
        }
    }, function(error) {
        console.error('Search failed:', error);
    }, ['Name'], { searchHidden: false });
}



