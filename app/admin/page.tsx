import { isAdmin } from '../../lib/auth';
import { getChatGPTUser,chatGPTSignInPath } from '../chatgpt-auth';
import Admin from './panel';
export const dynamic='force-dynamic';
export const metadata={title:'VisaWorld — управление заявками',robots:{index:false,follow:false}};
export default async function Page(){const user=await getChatGPTUser();if(!user)return <main className="admin-main"><a className="brand" href="/">VisaWorld</a><h2>Кабинет администратора / Әкімші кабинеті</h2><p>Войдите с разрешённым аккаунтом ChatGPT.<br/>Рұқсат берілген ChatGPT аккаунтымен кіріңіз.</p><a className="button primary" href={chatGPTSignInPath('/admin')} target="_top">Войти / Кіру</a></main>;if(!await isAdmin())return <main className="admin-main"><h2>Нет доступа / Рұқсат жоқ</h2><p>Этот аккаунт не назначен администратором. Доступ настраивается владельцем сайта.<br/>Бұл аккаунт әкімші ретінде тағайындалмаған.</p><a className="button primary" href="/">На главную / Басты бет</a></main>;return <Admin/>}
