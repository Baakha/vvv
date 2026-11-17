import { getDb } from '../../../db';
import { leads } from '../../../db/schema';
import { and,eq,gt,count } from 'drizzle-orm';
import { z } from 'zod';
import { sameOrigin } from '../../../lib/auth';
import {PRIVACY_VERSION,CONSENT_COPY} from '../../../lib/privacy';
export const dynamic='force-dynamic';
const schema=z.object({id:z.string().uuid(),name:z.string().trim().min(2).max(120),phone:z.string().transform(s=>s.replace(/[^\d+]/g,'')).refine(s=>/^\+?[0-9]{10,15}$/.test(s)),destination:z.enum(['australia','usa','korea','germany','other']),purpose:z.enum(['work','tourism','visit','business','study','other']),language:z.enum(['ru','kk']),consent:z.literal(true),consentVersion:z.literal(PRIVACY_VERSION),website:z.string().max(0),source:z.string().max(150)});
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({error:'origin'},{status:403});
 if(Number(req.headers.get('content-length')||0)>4000)return Response.json({error:'size'},{status:413});
 try {
 const raw=await req.text();if(raw.length>4000)return Response.json({error:'size'},{status:413});
 const data=schema.safeParse(JSON.parse(raw));if(!data.success)return Response.json({error:'validation'},{status:400});
 const d=data.data; const db=getDb();
 const existing=await db.select({id:leads.id}).from(leads).where(eq(leads.id,d.id)).limit(1);
 if(existing.length)return Response.json({ok:true,id:d.id});
 const recent=await db.select({n:count()}).from(leads).where(and(eq(leads.phone,d.phone),gt(leads.createdAt,Date.now()-3600000)));
 if(recent[0].n>=3)return Response.json({error:'rate'},{status:429});
 await db.insert(leads).values({id:d.id,name:d.name,phone:d.phone,destination:d.destination,purpose:d.purpose,language:d.language,source:d.source,createdAt:Date.now(),consentVersion:PRIVACY_VERSION,consentAt:Date.now(),consentText:CONSENT_COPY[d.language],consentMethod:'unchecked-checkbox'}).onConflictDoNothing();
 return Response.json({ok:true,id:d.id},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'unavailable'},{status:503});}
}
