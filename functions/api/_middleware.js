const ALLOWED_DASHBOARD_ORIGINS=new Set([
  'https://drmacze.github.io',
  'https://gtavdashboard.pages.dev'
]);

function corsHeaders(origin){
  return {
    'Access-Control-Allow-Origin':origin,
    'Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type,Accept,X-Admin-Token',
    'Access-Control-Max-Age':'86400',
    'Vary':'Origin'
  };
}

export async function onRequest(context){
  const {request}=context;
  const origin=request.headers.get('Origin')||'';
  const allowed=ALLOWED_DASHBOARD_ORIGINS.has(origin);

  if(request.method==='OPTIONS'){
    if(!allowed)return new Response(null,{status:403});
    return new Response(null,{status:204,headers:corsHeaders(origin)});
  }

  let downstreamRequest=request;
  if(allowed){
    const headers=new Headers(request.headers);
    headers.set('Origin',new URL(request.url).origin);
    downstreamRequest=new Request(request,{headers});
  }

  const response=await context.next(downstreamRequest);
  if(!allowed)return response;

  const headers=new Headers(response.headers);
  for(const [key,value] of Object.entries(corsHeaders(origin)))headers.set(key,value);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
