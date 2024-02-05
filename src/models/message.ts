export enum AttachmentType {
  audio,
  document,
  image,
  sticker,
  video,
}

export class Message {
  content: string;
  readonly type: AttachmentType | undefined;

  constructor(content: string = '', type?: AttachmentType) {
    this.content = content;
    this.type = type;
  }
}
