import { initViewer, loadModel, getAccessToken } from './viewer.js';

const pathname = window.location.pathname;
const parts = pathname.split('/'); // This splits the pathname into parts
const partSearchDirty = parts[3]; // Assuming the structure is always "/3d/{partName}"

const backAdrDirty = parts[2];
const backAdrClean = decodeURI(backAdrDirty)
console.log(backAdrDirty); 

const backBtn = document.getElementById("back");

backBtn.addEventListener("click", ()=>{
    window.location.href=`/${backAdrClean}`
})


initViewer(document.getElementById('preview')).then(viewer => {

    // const urn = window.location.hash?.substring(1);

    const urnHashmap = new Map();

    urnHashmap.set('blender', 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aWE0MGtxd29hNWV1c29ieWpuZXJvYXFqYWJhNTV0cm1obnhzdWhlYzNqbGtsdGVrLWJhc2ljLWFwcC9DQUQtMTAyMTctUmV2MDEtQmxlbmRlciUyMDMuMCUyMEFzc2VtYmx5LlNURVA');
    urnHashmap.set('mainsupport', 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aWE0MGtxd29hNWV1c29ieWpuZXJvYXFqYWJhNTV0cm1obnhzdWhlYzNqbGtsdGVrLWJhc2ljLWFwcC9NYWluJTIwU3VwcG9ydCUyMDEuMS5zdGVw');
    urnHashmap.set('doors', 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aWE0MGtxd29hNWV1c29ieWpuZXJvYXFqYWJhNTV0cm1obnhzdWhlYzNqbGtsdGVrLWJhc2ljLWFwcC9Eb29ycyUyMDEuMi5zdGVw')
    urnHashmap.set('gantryprojector', "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aWE0MGtxd29hNWV1c29ieWpuZXJvYXFqYWJhNTV0cm1obnhzdWhlYzNqbGtsdGVrLWJhc2ljLWFwcC9YWSUyMEdhbnRyeSUyMGFuZCUyMFByb2plY3RvciUyMDIuMS5zdGVw")
    urnHashmap.set('carriage', "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aWE0MGtxd29hNWV1c29ieWpuZXJvYXFqYWJhNTV0cm1obnhzdWhlYzNqbGtsdGVrLWJhc2ljLWFwcC9MTTMlMjAtJTIwQ2FycmlhZ2Uuc3RlcA")
    urnHashmap.set('vertical', "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aWE0MGtxd29hNWV1c29ieWpuZXJvYXFqYWJhNTV0cm1obnhzdWhlYzNqbGtsdGVrLWJhc2ljLWFwcC9MTlMlMjAtJTIwVmVydGljYWwuc3RlcA")
    urnHashmap.set('electrical', "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aWE0MGtxd29hNWV1c29ieWpuZXJvYXFqYWJhNTV0cm1obnhzdWhlYzNqbGtsdGVrLWJhc2ljLWFwcC9FbGVjdHJpYyUyMFBhbmVsLnN0ZXA")
    urnHashmap.set('fumebox', 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aWE0MGtxd29hNWV1c29ieWpuZXJvYXFqYWJhNTV0cm1obnhzdWhlYzNqbGtsdGVrLWJhc2ljLWFwcC9GdW1lJTIwQm94JTIwU3lzdGVtLnN0ZXA')
    urnHashmap.set('blendrails', "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aWE0MGtxd29hNWV1c29ieWpuZXJvYXFqYWJhNTV0cm1obnhzdWhlYzNqbGtsdGVrLWJhc2ljLWFwcC9CbGVuZHJhaWxzXy5zdGVw")
    urnHashmap.set('dogbowl', "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aWE0MGtxd29hNWV1c29ieWpuZXJvYXFqYWJhNTV0cm1obnhzdWhlYzNqbGtsdGVrLWJhc2ljLWFwcC9Eb2dib3dsLnN0ZXA")
    const urn = urnHashmap.get(backAdrClean);

    setupModelSelection(viewer, urn);
    setupModelUpload(viewer);
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

    console.log("urn ", urn);
    // https://developer.api.autodesk.com/modelderivative/v2/regions/eu/designdata/{urn}/metadata/878e6b97-35e9-47b4-8a9c-64b5d3b5376a/properties

    model.getObjectTree(function onSuccessCallback(tree){
        console.log(tree);
    }, function onFailcallback(er){
        console.log(er);
    })

    let partSearchClean = decodeURIComponent(partSearchDirty); // Decodes %20 to spaces, %21 to "!"

    const txt1 = "6153K88_Stainless"
    console.log(partSearchClean);
    searchAndHighlight(viewer, partSearchClean);

    
    
   
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
