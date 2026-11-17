import { isAdmin,sameOrigin } from '../../../lib/auth';
import { getDb } from '../../../db';
import { leads } from '../../../db/schema';
import { desc,eq } from 'drizzle-orm';
import { z } from 'zod';
export const dynamic='force-dynamic';
export async function GET(){if(!await isAdmin())return Response.json({error:'forbidden'},{status:403});try {return Response.json({leads:await getDb().select().from(leads).orderBy(desc(leads.createdAt)).limit(1000)},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'unavailable'},{status:503});}}
export async function PATCH(req:Request){if(!sameOrigin(req)||!await isAdmin())return Response.json({error:'forbidden'},{status:403});try{const data=z.object({id:z.string().uuid(),status:z.enum(['new','contacted','working','closed','archived']),note:z.string().max(2000)}).safeParse(await req.json());if(!data.success)return Response.json({error:'validation'},{status:400});const rows=await getDb().update(leads).set({status:data.data.status,note:data.data.note}).where(eq(leads.id,data.data.id)).returning({id:leads.id});return Response.json({ok:rows.length>0},{status:rows.length?200:404});}catch{return Response.json({error:'unavailable'},{status:503});}}
