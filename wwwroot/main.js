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

    // getAllDbIds(viewer);

    // getAllInstanceTreeNodes(viewer)
    // getChildren(viewer);

   
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
    const modelGuid = '878e6b97-35e9-47b4-8a9c-64b5d3b5376a';

    const url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/${modelGuid}`;

    
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



function getChildren(view){
    console.log("Function called");
    const parentDiv = document.getElementsByClassName('model-div');
    console.log(parentDiv);
    const children = parentDiv.children; 

    children.forEach(child => {
        console.log(child);
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



