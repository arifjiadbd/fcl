import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1aXAQ2pHvDgA3KqgIqVs5EvSypj5HdC5v_ssw8BNL5MZTQssgZErW2TEQ3cNEA-fL/exec';
const COOKIE = 'fcl_admin_session';
const TTL = 8 * 60 * 60;
const attempts = new Map<string,{count:number,until:number}>();
function fail(message:string,status=502){return NextResponse.json({status:'error',message},{status});}
function equal(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
function sign(value:string,secret:string,pin:string){return createHmac('sha256',secret).update('fcl-session:'+pin+':'+value).digest('hex');}
function valid(req:NextRequest,secret:string,pin:string){const token=req.cookies.get(COOKIE)?.value||'';const [expiry,nonce,mac,...extra]=token.split('.');return !!mac&&!!nonce&&!extra.length&&Number(expiry)>Date.now()&&equal(mac,sign(expiry+'.'+nonce,secret,pin));}
function cookie(res:NextResponse,value:string,maxAge:number){res.cookies.set(COOKIE,value,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge});return res;}
async function call(body?:object){
 const res=await fetch(GOOGLE_SCRIPT_URL,{cache:'no-store',redirect:'follow',signal:AbortSignal.timeout(45000),...(body?{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)}:{})});
 const raw=await res.text();
 if(!res.ok){console.error('[Newspaper] Google HTTP status:',res.status);throw Error(`Google Apps Script HTTP ${res.status}. Check deployment and access permissions.`);}
 let data;
 try{data=JSON.parse(raw);}catch{console.error('[Newspaper] Google returned non-JSON; content type:',res.headers.get('content-type'));throw Error('Google Apps Script returned non-JSON. Check Web app deployment and authorization.');}
 if(!data||data.status!=='success')throw Error(typeof data?.message==='string'?data.message:'Google Script failed');
 return data;
}
export async function GET(){try{return NextResponse.json(await call(),{headers:{'Cache-Control':'no-store'}});}catch(e){return fail(e instanceof Error?e.message:'Unable to load news');}}
export async function POST(req:NextRequest){
 const origin=req.headers.get('origin');
 if(origin&&origin!==req.nextUrl.origin&&origin!==`${req.nextUrl.protocol}//${req.headers.get('host')}`)return fail('Invalid origin',403);
 try{
  const raw=await req.text();if(raw.length>3000000)return fail('Image too large',413);
  const body=JSON.parse(raw);const pin=process.env.FCL_ADMIN_PIN||'';const secret=process.env.NEWSPAPER_WRITE_SECRET||'';
  if(body.action==='logout')return cookie(NextResponse.json({status:'success'}),'',0);
  if(body.action==='session')return NextResponse.json({authenticated:!!pin&&!!secret&&valid(req,secret,pin)});
  if(!/^\d{6}$/.test(pin)||secret.length<32)return fail('Admin setup missing: FCL_ADMIN_PIN / NEWSPAPER_WRITE_SECRET',503);
  if(body.action==='login'){
   const now=Date.now();for(const [k,v] of attempts)if(v.until<=now)attempts.delete(k);
   const ip=req.headers.get('x-real-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'local';
   const a=attempts.get(ip)||{count:0,until:now+15*60*1000};
   if(a.count>=5)return fail('Too many attempts. Try again in 15 minutes.',429);
   if(typeof body.pin!=='string'||!equal(body.pin,pin)){attempts.set(ip,{...a,count:a.count+1});return fail('Incorrect PIN',401);}
   attempts.delete(ip);const value=`${now+TTL*1000}.${randomBytes(16).toString('hex')}`;
   return cookie(NextResponse.json({status:'success',authenticated:true}),value+'.'+sign(value,secret,pin),TTL);
  }
  if(!valid(req,secret,pin))return fail('Please log in again',401);
  if(!['add','edit','update','delete'].includes(body.action))return fail('Invalid action',400);
  return NextResponse.json(await call({...body,secret}));
 }catch(e){return fail(e instanceof Error?e.message:'Save failed');}
}
