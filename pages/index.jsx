import dynamic from 'next/dynamic';
import HeroShell from '../components/HeroShell';

const ClientApp = dynamic(() => import('../components/AppClient'), { ssr: false });

export default function Home() {
  return (
    <>
      <HeroShell />
      <ClientApp />
    </>
  );
}
