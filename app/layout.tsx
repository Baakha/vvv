import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL('https://visaworld-kaz-consult.starrybead22.chatgpt.site'),title:'VisaWorld — визовое сопровождение',description:'Планируйте поездку с VisaWorld. Оставьте заявку на консультацию по визовым вопросам. Русский и қазақша.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>}
