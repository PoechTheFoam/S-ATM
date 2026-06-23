let checkbox=null;
let exported={};
let settings={
    toggle_marking:true,
    toggle_log:true
};
let IDs=new Set();
let isSaving=false;
initialize();

chrome.runtime.onMessage.addListener(async (message,sender,sendResponse)=>{
    if (message.type==="settings_changed"){
        settings=message.settings;
    }
    if (message.type==="import"){
        exported=await loadExportedQuestions();
        settings=await loadSettings();
    }

    if (message.type==="clear"){
        await clearSavedLog();
    }
    
    refreshExportedMarking();
})

let transitionTime=250;
let confirmationTime=1000;

const popup=document.createElement('div');
    popup.id="log_tracker";
    popup.style.position = 'fixed';
    popup.style.top = '90px';
    popup.style.right = '12px';
    popup.style.width = '200px';
    popup.style.height = '230px';
    popup.style.backgroundColor = '#ffffff';
    popup.style.border = '2px solid #ccc';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    popup.style.zIndex = '999999';
    popup.style.opacity = "1";
    popup.style.transition = `opacity ${transitionTime}ms ease`;
    popup.innerHTML=`
    <div style="background: #f1f1f1; padding: 5px;">
    <div class="header" style="border-bottom: 1.5px solid #ccc; padding-bottom: 5px; line-height:1.1">
    <h2 id="title" style="font-size:1.5rem; text-align:center;margin:0 0 6px 0">Selected Questions</h2>
    <h3 id="selected-count" style="font-size:1.2rem; margin:0">Selected: </h3>
    </div>
    <div class="body" style="border-bottom: 1.5px solid #ccc; padding: 3px;max-height:80px;overflow-y:auto;margin-bottom:8px">
    <ol id="selected-IDs" style="margin:4px 0; padding-left:24px"></ol>
    </div>
    <div class="footer" style="padding-top:4px">
    <button id="export-confirm-btn" style="padding: 10px; margin:5px">Mark as exported</button>
    <button id="close-btn" style="padding: 10px;margin:5px">Close</button>
    <h3 id="confirm-msg" style="font-size:1rem;margin=5px"></h3>
    </div>
    </div>
    `;
popup.querySelector("#close-btn").addEventListener('click',()=>{
    fadeOutTransition(0);
})
const export_confirm_btn=popup.querySelector("#export-confirm-btn");
const confirm_msg=popup.querySelector("#confirm-msg");
export_confirm_btn.addEventListener('click',async ()=>{
    if (isSaving) return;
    isSaving=true;
    export_confirm_btn.disabled=true;
    export_confirm_btn.textContent="Saving...";
    try{
        await saveQuestions();
        if (IDs.size===1)confirm_msg.innerText=IDs.size+" ID marked as exported";
        else confirm_msg.innerText=IDs.size+" IDs marked as exported"
        exported= await loadExportedQuestions();
        refreshExportedMarking();
        // reset IDs

        IDs.clear();
        
        fadeOutTransition(confirmationTime);
    }catch(error){
        confirm_msg.innerText="Save failed"
        console.log(error);
    }finally{
        isSaving=false;
        export_confirm_btn.disabled=false;
        export_confirm_btn.textContent="Mark as exported"
    }
})

let fadeOutTimerOuter=null;
let fadeOutTimerInner=null;
let fadeInFrame=null;

function cancelFadeAnimations(){
    clearTimeout(fadeOutTimerOuter);
    clearTimeout(fadeOutTimerInner);
    if (fadeInFrame) cancelAnimationFrame(fadeInFrame);


    fadeOutTimerInner=null;
    fadeOutTimerOuter=null;
    fadeInFrame=null;

    popup.style.opacity="1";
}

function fadeOutTransition(delay=confirmationTime){
    cancelFadeAnimations();

    fadeOutTimerOuter=setTimeout(()=>{
        popup.style.opacity="0";

        fadeOutTimerInner=setTimeout(()=>{
            popup.style.display="none";
            popup.style.opacity="1";
        },transitionTime);
    },delay);
}

function fadeInTransition(){
    cancelFadeAnimations();

    popup.style.display='';
    popup.style.opacity="0";

    fadeInFrame=requestAnimationFrame(()=>{
        fadeInFrame=null;
        popup.style.opacity="1";
    })
}

document.addEventListener('change',(event)=>{
    const target=event.target;
    if (target.matches("input[type='checkbox']") && target.closest("td.checked-column")){

        // getting the current checkbox that was changed
        let current_ID=target.getAttribute("aria-labelledby");
        let current_checked=target.checked;

        // if the ID is found
        if (IDs.has(current_ID)){
            if (current_checked===false) IDs.delete(current_ID);
        }

        // if not found
        else {
            if (current_checked===true) IDs.add(current_ID);
        }

        updateLog_Tracker(IDs);
    }
    else return;  
})

function updateLog_Tracker(){
    if (!document.getElementById('log_tracker')) document.body.appendChild(popup);
    if (document.getElementById('log_tracker')){
        cancelFadeAnimations();
        if (IDs.size===0){
        fadeOutTransition(0);
        return;
        }
        fadeInTransition();
        popup.querySelector("#selected-count").innerText="Selected: "+IDs.size;
        const ID_list=popup.querySelector("#selected-IDs");
        ID_list.innerText='';
        for (const id of IDs){
            let li=document.createElement('li');
            li.innerText=id;
            ID_list.append(li);
            let list_container=popup.querySelector(".body");
            list_container.scrollTop=list_container.scrollHeight;
        }
        return;
    }
}
async function saveQuestions(){
    const saveTime=new Date().toISOString();
        const result=await chrome.storage.local.get("satm_state");
        let satm_state=result.satm_state;
        if (satm_state===undefined) satm_state={};
        if (satm_state.exported===undefined){
            satm_state.exported={}
        }
    for (const id of IDs){
        satm_state.exported[id]={exportedAt:saveTime};
    };
    await chrome.storage.local.set({
            satm_state:satm_state
        }).catch((error)=>{
            console.error(error);
        });
}
async function loadExportedQuestions(){
    const result=await chrome.storage.local.get("satm_state");
    if (result===undefined||result.satm_state===undefined||result.satm_state.exported===undefined) return {};
    return result.satm_state.exported;
    
}
async function loadSettings(){
    const result=await chrome.storage.local.get("satm_state")
    const settings=result.satm_state?.settings;

    return {
        toggle_marking: settings?.toggle_marking ?? true,
        toggle_log: settings?.toggle_log ?? true
    }
}

async function initialize(){
    checkbox=await waitForElement("td.checked-column input[type='checkbox']");
    if (checkbox) {
        exported=await loadExportedQuestions();
        settings=await loadSettings();
        console.log("exported keys:", Object.keys(exported));
        refreshExportedMarking();
        setUpTableObserver(checkbox);
    }else {
        console.log("failed boohoo")
        return;
    }
    
}
function waitForElement(selector){
    return new Promise((resolve)=>{
        const element=document.querySelector(selector);
        if (element) return resolve(element);

    const observer=new MutationObserver((mutations,obs)=>{
        const target=document.querySelector(selector);
        if (target){
            obs.disconnect();
            resolve(target);
        }
    });
    observer.observe(document.body,{
        childList:true,
        subtree:true
    });
});
}
function setUpTableObserver(checkbox){
        console.log("setting up table obs")
        let target=checkbox.closest("tbody");
        const observer=new MutationObserver((mutations, obs)=>{
        for (const mutation of mutations){
        if (mutation.type==='childList'||
            mutation.type==='attributes'||
            mutation.type==='characterData'            
        ){
            scheduleMarkExported();
            break;
        }
    }
})
    observer.observe(target,{childList:true,subtree:true,attributes:true,characterData:true,attributeFilter: ["id", "aria-label", "aria-labelledby"]
}) 
}
function markExportedQuestions(exported){
    let visibleCheckboxes=document.querySelectorAll("td.checked-column input[type='checkbox']");
    for (const vcb of visibleCheckboxes){
        const row=vcb.closest('tr');
        if (!row) continue;
        row.classList.remove('satm-marked');
        row.style.backgroundColor="transparent";
    }

    for (const vcb of visibleCheckboxes){
        const id=vcb.getAttribute("aria-labelledby");
        const row=vcb.closest("tr");
        if (!row) continue;
        if (id in exported){
            row.classList.add("satm-marked");
            row.style.backgroundColor= "#ADD8E6";
        }
    }
}
function unmarkExportedQuestions(){
    let visibleCheckboxes=document.querySelectorAll("td.checked-column input[type='checkbox']");
    for (const vcb of visibleCheckboxes){
        const row=vcb.closest('tr');
        if (!row) continue;
        row.classList.remove('satm-marked');
        row.style.backgroundColor="transparent";
    }
}
function refreshExportedMarking(){
    if (settings.toggle_marking) markExportedQuestions(exported);
    else unmarkExportedQuestions();
}

async function exportData(){

}

async function importData(){

}

async function clearSavedLog() {
    let result=await chrome.storage.local.get("satm_state");
    let satm_state=result.satm_state;
    if (satm_state===undefined) return; //because exported wouldn't exist anyway
    satm_state.exported={};
    await chrome.storage.local.set({satm_state:satm_state});
    exported={};
    console.log("Log cleared yayay :3")
}



let markScheduled=false;
        function scheduleMarkExported(){
        if (markScheduled) return;
        markScheduled=true;
        requestAnimationFrame(()=>{
            markScheduled=false;
            refreshExportedMarking();
        });
        }
//to the person reading this, uwu sussy baka.