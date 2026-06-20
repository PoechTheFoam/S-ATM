/*chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab)=>{
    if (tab.url && (changeInfo.status==="complete")){
        chrome.scripting.executeScript({
            target:{tabId:tabId},
            files: ["content.js"]
        })
        .then(()=>console.log("yayaya inject success uwuw"))
        .catch(e => console.error("Failed to inject uwu"));
    }
});*/
