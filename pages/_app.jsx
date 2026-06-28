import '../styles/globals.css'
import Head from 'next/head'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Akshat Sharma — Developer & Creative</title>
        <meta
          name="description"
          content="Akshat Sharma is a developer and creative based in Dubai, building software, hardware and games — from voice assistants to custom macropads. Explore projects, photography, experience and writing."
        />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <link rel="icon" href="/images/icon.ico" />

        {/* Open Graph / social preview */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Akshat Sharma — Developer & Creative" />
        <meta
          property="og:description"
          content="Developer and creative based in Dubai. Projects, photography, experience and writing."
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
