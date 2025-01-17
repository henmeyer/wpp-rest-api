'use client';
import Image, { type ImageProps } from 'next/image';
import { Button } from '@repo/ui/button';
import styles from './page.module.css';
import { useState } from 'react';
import { Axios } from './utils/axios';

type Props = Omit<ImageProps, 'src'> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  const [sessionName, setSessionName] = useState('');

  const startSession = async () => {
    if (!sessionName.length) return;
    const response = await Axios.post(`/whatsapps/${sessionName}`);
    alert(JSON.stringify(response.data));
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ThemeImage
          className={styles.logo}
          srcLight="club-athletico-paranaense.svg"
          srcDark="club-athletico-paranaense.svg"
          alt="CAP logo"
          width={500}
          height={500}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>apps/web/app/page.tsx</code>
            {process.env.NEXT_PUBLIC_WPP_URL}
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <label>
          Session Name{' '}
          <input
            name="sessionNameInput"
            type="text"
            onChange={e => setSessionName(e.target.value)}
          />
        </label>
        <div className={styles.ctas}>
          <button onClick={startSession} className={styles.secondary}>
            Start Session
          </button>
        </div>
        <Button appName="web" className={styles.secondary}>
          Open alert
        </Button>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://vercel.com/templates?search=turborepo&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://turbo.build?utm_source=create-turbo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to turbo.build →
        </a>
      </footer>
    </div>
  );
}
