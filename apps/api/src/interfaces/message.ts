export interface IMessage {
  text: string | undefined;
  attachment: { url: string; mimetype: string };
}

export enum AttachmentType {
  audio,
  document,
  image,
  sticker,
  video,
}
