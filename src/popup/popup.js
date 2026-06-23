document.addEventListener("DOMContentLoaded",async function (){
    let toggle_marking=document.querySelector("#toggle_marking");
    let toggle_log=document.querySelector("#toggle_log");
    let export_data=document.querySelector("#export_data");
    let import_data=document.querySelector("#import_data");
    let import_file=document.querySelector("#import_file")
    let clear_log=document.querySelector("#clear_log");
    let settings = await loadSettings();

    refreshToggles();

    toggle_marking.addEventListener("change", async function (){
        settings.toggle_marking=toggle_marking.checked;
        sendNewSettings(settings);
    });

    toggle_log.addEventListener("change", async function (){
        settings.toggle_log=toggle_log.checked;
        sendNewSettings(settings);
    });

    export_data.addEventListener('click',async ()=>{
        let result=await chrome.storage.local.get("satm_state");
        let satm_state=result.satm_state ?? {};
        const exported_data={satm_state,exportedAt:new Date().toISOString()};

        const json=JSON.stringify(exported_data,null,2);
        const blob=new Blob([json],{type:"application/json"});
        const url=URL.createObjectURL(blob);

        chrome.downloads.download({
            url,
            filename: `satm-log-${new Date().toISOString().slice(0, 10)}.json`,
            saveAs:true
        },()=>{
            URL.revokeObjectURL(url);
        });

    })
    import_data.addEventListener('click', async ()=>{
        await import_file.click();
        settings=await loadSettings();
        refreshToggles();
        sendClicks("import");
    })
    import_file.addEventListener('change',async ()=>{
        let file=import_file.files[0];
        if (!file) return;
        
        const text=await file.text();
        let data;
        try{data=JSON.parse(text)}catch(e){throw new Error("Invalid JSON file")};

        if (!isPlainObject(data)) throw new Error("Invalid import content");

        if (!isPlainObject(data.satm_state)) throw new Error("Invalid import content: No satm_state");

        const imported_state=data.satm_state;

        const imported_exported=imported_state?.exported ?? {};
        
        const result=await chrome.storage.local.get("satm_state");
        
        await chrome.storage.local.set({satm_state:imported_state});


        import_file.value=''; //reset
    })
    
    clear_log.addEventListener('click',()=>{
        sendClicks("clear");
    })

    function refreshToggles(){
        toggle_marking.checked=settings.toggle_marking;
        toggle_log.checked=settings.toggle_log;
    }
});

function isPlainObject(value){
    return value !==null&&typeof value==="object"&&!Array.isArray(value);
}

async function saveSettings(settings){
    const saveTime=new Date().toISOString();
    const result=await chrome.storage.local.get("satm_state");
    let satm_state=result.satm_state ?? {};
    satm_state.settings=settings;
    await chrome.storage.local.set({
        satm_state:satm_state
    }).catch((error)=>{
        console.error(error);
    });
};

async function loadSettings(){
    const result=await chrome.storage.local.get("satm_state")
    const settings=result.satm_state?.settings;

    return {
        toggle_marking: settings?.toggle_marking ?? true,
        toggle_log: settings?.toggle_log ?? true
    }
};

async function sendNewSettings(settings){
    chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
        let activeTab=tabs[0]?.id;
        if (!activeTab) return;

        chrome.tabs.sendMessage(activeTab,{
            type:"settings_changed",
            settings:{
                toggle_marking:toggle_marking.checked,
                toggle_log:toggle_log.checked
            }
        });
    });

    await saveSettings(settings);
}

function sendClicks(event){
        chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
        let activeTab=tabs[0]?.id;
        if (!activeTab) return;

        chrome.tabs.sendMessage(activeTab,{
            type:event
        });
    });
}