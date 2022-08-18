function fallbackCopyTextToClipboard(text){var textArea=document.createElement("textarea");textArea.value=text;document.body.appendChild(textArea);textArea.focus();textArea.select();try{var successful=document.execCommand('copy');var msg=successful?'successful':'unsuccessful';}catch(err){console.error('Fallback: Oops, unable to copy',err);}
document.body.removeChild(textArea);}
function copyTextToClipboard(text,callback){window.event.preventDefault();if(!navigator.clipboard){fallbackCopyTextToClipboard(text);if(callback){callback();}
return;}
navigator.clipboard.writeText(text).then(function(){if(callback){callback();}},function(err){console.error('Async: Could not copy text: ',err);});}