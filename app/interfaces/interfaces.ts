export interface IHttpHeader {
  [key: string]: string;
}

export interface ITranslation {
  [key: string]: any;
}

export interface IStorageData {
  content: string;
  lastModified: number;
}
