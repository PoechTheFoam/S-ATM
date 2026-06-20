let checkbox=null;
let exported={};
let toggle_marking=true;
let toggle_log=true;
let settings={};
let IDs=[];
let isSaving=false;
initialize();

chrome.runtime.onMessage.addListener(async (message,sender,sendResponse)=>{
    if (message.type==="settings_changed"){
        settings=message.settings;
        toggle_marking=settings.toggle_marking;
        toggle_log=settings.toggle_log;
    }
    if (message.type==="export"){
        exportData();
    }
    if (message.type==="import"){
        importData();
    }
    if (message.type==="clear"){
        await clearSavedLog();
    }
    await refreshExportedMarking();
})
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
    popup.innerHTML=`
    <div style="background: #f1f1f1; padding: 5px;border-bottom: 1px solid #ccc;">
    <div class="header">
    <h1 id="title" style="font-size:1.5rem; text-align:center;"><strong>Selected Questions</strong></h1> <br>
    <h2 id="selected-count" style="font-size:1.2rem;">Selected: </h2>
    </div>
    <div class="body" style="padding: 5px;max-height:80px;overflow-y:auto;">
    <ol id="selected-IDs"></ol>    
    </div>
    <div class="footer">
    <button id="export-confirm-btn" style="padding: 10px 10px;">Mark as exported</button>
    <button id="close-btn" style="padding: 10px 10px;">Close</button> <br>
    <h3 id="confirm-msg" style="font-size:1rem;"></h3>
    </div>
    </div>
    `;
popup.querySelector("#close-btn").addEventListener('click',()=>{
    popup.remove();
})
const export_confirm_btn=popup.querySelector("#export-confirm-btn");
const confirm_msg=popup.querySelector("#confirm-msg");
export_confirm_btn.addEventListener('click',async ()=>{
    if (isSaving) return;
    isSaving=true;
    export_confirm_btn.disabled=true;
    export_confirm_btn.textContent="Saving...";
    try{
        await saveQuestions(IDs);
        if (IDs.length===1)confirm_msg.innerText=IDs.length+" ID marked as exported";
        else confirm_msg.innerText=IDs.length+" IDs marked as exported"
        exported= await loadExportedQuestions();
        refreshExportedMarking();
    }catch(error){
        confirm_msg.innerText="Save failed"

    }finally{
        isSaving=false;
        export_confirm_btn.disabled=false;
        export_confirm_btn.textContent="Mark as exported"
    }
})
document.addEventListener('change',(event)=>{
    const target=event.target;
    if (target.matches("input[type='checkbox']") && target.closest("td.checked-column")){
        const checked=document.querySelectorAll("td.checked-column input[type='checkbox']:checked");
        IDs=getQuestionID(checked);
        updateLog_Tracker(IDs);
    }
    else return;  
})
function getQuestionID(checked){
    let output=[];
    for (const element of checked){
            output.push(element.getAttribute("aria-labelledby"));
        }
    return output;
}
function updateLog_Tracker(IDs){
    if (!document.getElementById('log_tracker')) document.body.appendChild(popup);
    if (document.getElementById('log_tracker')){
        if (IDs.length===0){
        popup.style.display='none';
        return;
        }
        popup.style.display='';
        popup.querySelector("#selected-count").innerText="Selected: "+IDs.length;
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
async function saveQuestions(IDs){
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
        toggle_marking=settings.toggle_marking;
        toggle_log=settings.toggle_log;
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
            console.log("Change detected");
            scheduleMarkExported();
            console.log("re-marked!!");
            break;
        }
    }
})
    observer.observe(target,{childList:true,subtree:true,attributes:true,characterData:true,attributeFilter: ["id", "aria-label", "aria-labelledby"]
}) 
}
async function markExportedQuestions(exported){
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
async function refreshExportedMarking(){
    if (toggle_marking) markExportedQuestions(exported);
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