class Socket{constructor(host){this.host=host;this.socket=new WebSocket(this.host);this.init();this.socket.onopen=()=>this.onconnect();return this;}
onconnect(){this.auth(token);this.onopen();return;}
onopen(){return;}
init(){this.socket.onmessage=(data)=>this.handleMessage(data);}
auth(token){this.socket.send(JSON.stringify({"type":"identify","data":{"token":token}}));this.joinNotifs();}
joinNotifs(){this.socket.send(JSON.stringify({"type":"subscribe_notifications","data":{}}));}
joinMatch(matchID){this.socket.send(JSON.stringify({"type":"subscribe_match","data":{"match_id":matchID}}));}
emit(type,data={}){this.socket.send(JSON.stringify({"type":type,"data":data}));}
handleMessage(msg){var jsonData=JSON.parse(msg.data);this.defHandler(jsonData);}
defHandler(data){switch(data.type){case 'score':this.onscore(data.data);break;case 'notification':this.onnotif(data.data);break;case 'match':this.onmatch(data.data);break;default:return;}}
onscore(data){return;}
onnotif(data){return;}
onmatch(data){return;}}