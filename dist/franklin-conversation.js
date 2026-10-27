(()=>{'use strict';
let previous=null;
const clean=q=>String(q||'').toLowerCase().normalize('NFKC').replace(/[’']/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
const response=(text,suggestions=[])=>({text,suggestions,topic:'conversation',grounded:true});
function isHelpRequest(q){
 const n=clean(q),words=n.split(' ');
 const allowed=new Set('you u can could would will please pls plz kindly help assist me us i need some a bit of assistance support with this that it your hey hi hei hello hallo halo hai yo franklin bro homie bang kak are able to do how get may want just yes sure really actually so well and thanks thank saya aku bisa boleh bantu membantu tolong dong kah nggak gak ga minta butuh bantuan apakah kamu anda saya aku ini ya bang kak'.split(' '));
 return words.length<=18&&/\b(help|assist|assistance|support|bantu|membantu|bantuan)\b/.test(n)&&words.every(w=>allowed.has(w));
}
function social(q){const n=clean(q);if(n.length>180||/[\r\n]/.test(q))return null;
 if(isHelpRequest(q))return response("Yes, I can help with GTA V and the GTA V iOS Project. What are you trying to do, and what is going wrong?",['Help with installation','My game crashes']);
 if(/^(?:hei|hey|hi|hello|hallo|halo|hai|yo|sup|wassup|good morning|good afternoon|good evening|selamat pagi|selamat siang|selamat sore|selamat malam)(?: there| franklin| bro| homie| bang| kak)?$/.test(n))return response("Hey, I'm here. What can I help you with: installation, a crash, or game settings?",['Help with installation','My game crashes']);
 if(/^(?:how are you|how are you doing|apa kabar|kamu apa kabar)$/.test(n))return response("I'm ready to help. How is the game running on your device?",['It runs well','I have a problem']);
 if(/^(?:thanks|thank you|thank you so much|thx|ty|makasih|terima kasih|makasi|thanks bro|thank you franklin)$/.test(n))return response("You're welcome. If something else comes up, tell me what happened and we'll work through it.");
 if(/^(?:bye|goodbye|see you|see ya|later|dadah|sampai jumpa)$/.test(n))return response('Take care. You can minimize the panel to keep this conversation, or use the red phone button to disconnect.');
 if(/^(?:who are you|siapa kamu|who is franklin|what can you do|apa yang bisa kamu lakukan|can you help me|help|help me|bantu|bantu saya|tolong|tolong bantu|i have a problem)$/.test(n))return response("I'm Franklin, the community helper. I can explain installation steps, match GTA V logs to XDE's recorded issues, and help with launcher settings. What are you trying to do, and where does it go wrong?",['Help with installation','My game crashes']);
 if(/^(?:youre stupid|you are stupid|bodoh|kamu bodoh|useless|not helpful|you dont understand|kamu tidak mengerti|jawaban tidak sesuai)$/.test(n))return response("Let's make this more specific. Tell me what you expected to happen and what actually happened. I won't treat a symptom match as a confirmed cause.");
 return null;}
function guide(q){const n=clean(q);if(n.length>160||/[\r\n]/.test(q))return null;
 if(/^(?:i dont understand|i do not understand|im confused|confused|bingung|saya bingung|tidak paham|nggak ngerti|ga ngerti|jelaskan lagi|explain again|make it simpler|simpler please)$/.test(n))return response(previous?'We can take it one step at a time. Which part of the previous answer is unclear: the file or folder, the setting, or what to do next?':'No problem. Are you installing the app, opening the game, or fixing a problem while playing?',previous?['Where can I find the logs?','Help with installation']:['Help with installation','My game crashes']);
 if(/^(?:yes|yeah|yep|ya|iya|ok|okay|oke|alright|done|sudah|udah|no|nope|tidak|belum)$/.test(n))return response(previous?'Got it. What happened after that step? Tell me whether it worked, showed an error, or stayed the same.':'What would you like to check first: installing the app or fixing an issue?', ['Help with installation','My game crashes']);
 if(/^(?:still not working|it doesnt work|not working|same issue|same problem|masih sama|masih gagal|tetap sama)$/.test(n))return response('What happens now, and at which step? Keep your current app build selected and attach run.log or crash-*.txt with the paperclip. Please include the action immediately before the problem. A log match is a clue, not a confirmed diagnosis.',['Where can I find the logs?','How do I identify my build?']);
 if(/^(?:it runs well|it worked|it works|fixed|resolved|berhasil|sudah bisa|sudah berhasil)$/.test(n))return response('Good, the reported symptom is resolved for this session. Keep a note of the setting or step that helped. If it returns, attach a new log so we can compare what changed.');
 return null;}
const expansions={install:'How do I install GTA V iOS?',installation:'How do I install GTA V iOS?',pasang:'How do I install GTA V iOS?',download:'Where do I download the latest build?',unduh:'Where do I download the latest build?',logs:'Where can I find the logs?',log:'Where can I find the logs?',update:'How do I update the launcher?',updates:'Where are the latest launcher updates?',settings:'How can I check graphics performance?',lag:'GTA V has FPS drops and gets hot',ngelag:'GTA V has FPS drops',panas:'GTA V phone gets hot',crash:'GTA V crashes',ngecrash:'GTA V crashes',controller:'Does GTA V iOS support controllers?',save:'How do I import a save?',saves:'How do I import a save?',compatibility:'How do I check device compatibility?'};
function expand(q){const n=clean(q);return expansions[n]||q;}
function remember(q,result){if(result&&!['conversation','off-topic','unknown'].includes(result.topic))previous={question:String(q).slice(0,500),topic:result.topic};}
document.addEventListener('franklin-disconnect',()=>{previous=null;});
window.FranklinConversation={social,guide,expand,remember,isHelpRequest};
})();
