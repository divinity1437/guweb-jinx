function saveStorageDelayed(b,data,expire=86400*30){if(timers[b]){clearTimeout(timers[b]);}
timers[b]=setTimeout(saveStorage,2000,b,data,expire);}
function saveStorage(b,data,expire=86400*30){if(!localStorage.getItem(b)){localStorage.setItem(b+'_expire',new Date().getTime()/1000+expire);console.log("new init storage ",b);}
localStorage.setItem(b,JSON.stringify(data));console.log(b,"storage saved");}
function loadStorage(b){var c=localStorage.getItem(b);if(c){var expire=localStorage.getItem(b+'_expire');if(parseInt(expire)<new Date().getTime()/1000){console.log("storage for ",b," are expired");localStorage.removeItem(b);localStorage.removeItem(b+'_expire');}else{return JSON.parse(c);}}
return{}}
var timers={};var cachedUsers=loadStorage('cachedUsers');var cachedMaps=loadStorage('cachedMaps');