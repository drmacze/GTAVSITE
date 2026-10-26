/* Import values are taken from the supplied launcher export, not inferred enums. */
const graphicsProfileRules=Object.freeze({
 build(model,template){
  if(!model||!model.chip||!Number.isFinite(model.ram))throw Error('Verified chip and RAM specifications are required. No configuration has been generated.');
  if(/^A1[12](?:\D|$)/.test(model.chip)||model.ram<4)throw Error('This model needs a separate legacy graphics path. A verified export for this device is required before an import file can be offered. Use the launcher’s Battery Saver preset and check the release notes.');
  if(template.format!=='gtav-graphics-settings'||template.version!==1||template.settings?.res!=='960x540'||template.settings?.limit!=='3')throw Error('The launcher reference format could not be verified. Please try again later.');
  const output=JSON.parse(JSON.stringify(template));
  output.from=`${model.name} (${model.chip}, ${model.ram} GB)`;output.ramGB=model.ram;
  // Retain known import values, including the low-memory path, on every device.
  return output;
 },
 filename(model,extension='json'){return `GTA V graphics settings (${model.name.replace(/[^a-zA-Z0-9 -]/g,'')}).${extension}`;}
});
if(typeof module!=='undefined')module.exports=graphicsProfileRules;
if(typeof document!=='undefined'){
const graphicsAssistant=(()=>{
 const $=id=>document.getElementById(id);let model=null,serialized='',ticket=0;
 const generate=$('graphics-generate');
 function reset(next){model=next;ticket++;serialized='';$('graphics-output').hidden=true;$('graphics-error').hidden=true;$('graphics-status').textContent='';generate.hidden=false;generate.disabled=false;generate.textContent='Prepare settings ↗';}
 function download(extension){if(!serialized)return;const blob=new Blob([serialized+'\n'],{type:extension==='json'?'application/json':'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=graphicsProfileRules.filename(model,extension);document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);$('graphics-status').textContent='Your file is ready. Import it through the launcher’s Settings menu.';}
 generate.addEventListener('click',async()=>{const current=++ticket;generate.disabled=true;generate.textContent='Preparing your configuration…';$('graphics-error').hidden=true;
 try{const response=await fetch('graphics-template.json');if(!response.ok)throw Error('The launcher template could not be loaded. Please try again.');const template=await response.json();if(current!==ticket)return;const output=graphicsProfileRules.build(model,template);serialized=JSON.stringify(output,null,2);$('graphics-device').textContent=model.name;$('graphics-json').textContent=serialized;$('graphics-rationale').textContent=`${model.chip} · ${model.ram} GB installed RAM. ${model.ram===4?'Memory is constrained; the supplied low-memory profile is retained.':'Additional RAM does not guarantee a higher app memory limit, so the supplied low-memory profile is retained.'} This keeps the exact settings values from the iPhone 11 reference export; it does not claim to be an optimized preset for this model.`;$('graphics-output').hidden=false;generate.hidden=true;$('graphics-download').focus();}
 catch(error){if(current!==ticket)return;$('graphics-error').textContent=error.message;$('graphics-error').hidden=false;}
 finally{if(current===ticket){generate.disabled=false;generate.textContent='Prepare settings ↗';}}
 });
 $('graphics-download').addEventListener('click',()=>download('json'));$('graphics-text-download').addEventListener('click',()=>download('txt'));
 $('graphics-copy').addEventListener('click',async()=>{if(!serialized)return;try{await navigator.clipboard.writeText(serialized);$('graphics-status').textContent='Settings text copied. Paste it into the launcher’s import field.';}catch{$('graphics-status').textContent='Clipboard unavailable. Download the text file or select the configuration below.';$('graphics-json').parentElement.open=true;}});
 return {reset};
})();
window.graphicsAssistant=graphicsAssistant;
}
