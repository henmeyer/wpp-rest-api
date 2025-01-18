"use client";
import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { Axios } from "./utils/axios";
import { WhatsApp } from "./types";
import TableComponent from "./components/whatsapps/TableComponent";

type Props = Omit<ImageProps, "src"> & {
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
  const [sessionName, setSessionName] = useState("");
  const [sessions, setSessions] = useState<WhatsApp[]>([]);

  useEffect(() => {
    getSessions();
  }, []);

  const startSession = async () => {
    if (!sessionName.length) return;
    try {
      await Axios.post(`/whatsapps/${sessionName}`);
      alert(`Session ${sessionName} has started`);
      setSessions([...sessions, { name: sessionName }]);
    } catch (error) {
      setSessions(sessions.filter(s => s.name !== sessionName));
      alert("Error starting WhatsApp session");
    }
  };

  const getSessions = async () => {
    try {
      const { data } = await Axios.get("/whatsapps");
      setSessions(data.data as WhatsApp[]);
    } catch (error) {
      alert("Error getting WhatsApp sessions");
    }
  };

  const closeSession = async (name: string) => {
    try {
      await Axios.delete(`/whatsapps/${name}`);
      setSessions(sessions.filter(s => s.name !== name));
      alert(`Session ${sessionName} was deleted`);
    } catch {
      alert("Error deleting WhatsApp session");
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.ctas}>
          <input
            name="sessionNameInput"
            type="text"
            placeholder="Session name"
            onChange={e => setSessionName(e.target.value)}
          />
          <button onClick={startSession}>Start Session</button>
        </div>
        <TableComponent
          columns={["Name", "Actions"]}
          rows={sessions}
          closeFunction={closeSession}
        ></TableComponent>
        <button onClick={getSessions}>Update</button>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
