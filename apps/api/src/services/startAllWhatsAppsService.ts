import { WHATSAPP_STATUS } from "../constants";
import redis from "../db/redis";
import { asyncTimeout } from "../helpers/asyncTimeout";
import { WhatsApp } from "../models/whatsapp";

const startAllWhatsAppsService = async () => {
  const allWhatsApps = await redis.search(
    "idx:whatsapps",
    `@status:[${WHATSAPP_STATUS.qr} ${WHATSAPP_STATUS.connected}]`,
  );

  if (!allWhatsApps?.documents) return;

  for await (const { value } of allWhatsApps.documents) {
    const whatsapp = value as { name: string; status: number };
    await asyncTimeout(1000);
    new WhatsApp(whatsapp.name);
  }
};

export default startAllWhatsAppsService;
