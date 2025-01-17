import { WhatsApp } from './whatsapp';

class SessionsArray {
  private readonly whatsapps: WhatsApp[] = [];

  get allWhatsApps(): WhatsApp[] {
    return this.whatsapps;
  }

  find(name: string): WhatsApp | undefined {
    return this.whatsapps.find(whatsapp => whatsapp.name.includes(name));
  }

  push(whatsapp: WhatsApp): void {
    const index = this.findIndex(whatsapp.name);

    if (index === -1) {
      this.whatsapps.push(whatsapp);
    } else {
      this.whatsapps[index] = whatsapp;
    }
  }

  pop(name: string): WhatsApp | void {
    const index = this.findIndex(name);
    if (index > -1) {
      const whatsapp = this.whatsapps[index];
      this.whatsapps.splice(index, 1);
      return whatsapp;
    }
  }

  private findIndex(name: string): number {
    return this.whatsapps.findIndex(whatsapp => whatsapp.name.includes(name));
  }
}

export default new SessionsArray();
