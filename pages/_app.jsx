import '../styles/globals.css';
import Head from 'next/head';
import { useRouter } from 'next/router';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://akshatshh.vercel.app';

const DEFAULT_TITLE = 'Akshat Sharma';
const DEFAULT_DESCRIPTION =
  'Akshat Sharma. Aspiring Computer Engineer based in Dubai. Portfolio featuring hardware, mobile apps, games and photography — rendered inside a reactive ASCII ocean.';
const OG_IMAGE = `${SITE_URL}/images/ascii/real_pfp.jpg`;

// Structured data describing Akshat as a Person. Search engines and LLMs
// use this to power rich cards and knowledge answers.
const PERSON_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Akshat Sharma',
  alternateName: 'akshat.ssh',
  url: SITE_URL,
  image: OG_IMAGE,
  jobTitle: 'Aspiring Computer Engineer',
  email: 'mailto:ItsAkshatSh@gmail.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Dubai',
    addressCountry: 'AE',
  },
  sameAs: [
    'https://github.com/ItsAkshatSh',
    'https://www.linkedin.com/in/akshat404/',
    'https://www.instagram.com/akshat.ssh/',
  ],
};

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const canonical = `${SITE_URL}${(router.asPath || '/').split('?')[0]}`;

  return (
    <>
      <Head>
        <title>{DEFAULT_TITLE}</title>
        <meta name="description" content={DEFAULT_DESCRIPTION} />
        <meta name="author" content="Akshat Sharma" />
        <meta
          name="keywords"
          content="Akshat Sharma, akshat.ssh, portfolio, Dubai, computer engineer, developer, hardware, PCB design, Flutter, game development, ASCII art, personal website"
        />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={canonical} />

        {/* Viewport + theme */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#060a10" />
        <meta name="color-scheme" content="dark" />

        {/* Favicons */}
        <link rel="icon" href="/images/icon.ico" />
        <link rel="apple-touch-icon" href="/images/ascii/real_pfp.jpg" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Akshat Sharma" />
        <meta property="og:title" content={DEFAULT_TITLE} />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:alt" content="Akshat Sharma portrait" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={DEFAULT_TITLE} />
        <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:image:alt" content="Akshat Sharma portrait" />

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_SCHEMA) }}
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
