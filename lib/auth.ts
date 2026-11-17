import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
export async function isAdmin(){
 const user = await getChatGPTUser();
 const list = ((env as unknown as Record<string,string>).ADMIN_EMAILS || '').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
 return !!user && list.includes(user.email.toLowerCase());
}
export function sameOrigin(req:Request){ const origin=req.headers.get('origin');return !!origin && origin===new URL(req.url).origin; }
