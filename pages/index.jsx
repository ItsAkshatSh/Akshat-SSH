import dynamic from 'next/dynamic'

const ClientApp = dynamic(() => import('../components/AppClient'), { ssr: false });

export default function Home() {
  return <ClientApp />
}
