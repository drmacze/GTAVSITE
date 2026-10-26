/* Shared, deterministic lookup. The Welcome answer is the only model source. */
const savedDeviceProfile = Object.freeze({
  resolve(record,models){
    if(!record||!['ios','android'].includes(record.device))return {status:'missing'};
    if(record.device==='android')return {status:'android'};
    const name=typeof record.model==='string'?record.model.trim():'';
    const model=models.find(item=>item.name.toLowerCase()===name.toLowerCase());
    if(model)return {status:'ready',model};
    return {status:name?'unknown':'missing',name};
  }
});
if(typeof module!=='undefined')module.exports=savedDeviceProfile;
