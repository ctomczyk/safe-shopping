import { config } from '../config';
import { IHttpHeader, IStorageData } from '../interfaces/interfaces';

export class CommonUtility {

  private static reMethod: RegExp = /^(function|object)$/;
  private static reUnknown: RegExp = /^unknown$/;

  public static createCSS(content: string, appendToElement: Element | ShadowRoot = document.head, id?: string, media?: string): HTMLStyleElement {
    if (content === null) {
      throw new Error(`[CommonUtility.createCSS] passed content is not a string. Is type ${typeof content}`);
    }

    const style: HTMLStyleElement = document.createElement('style');

    if (typeof id === 'string') {
      style.id = id;
    }

    if (typeof media === 'string' && media.length > 0) {
      style.setAttribute('media', media);
    }

    if (typeof style['styleSheet' as keyof typeof style] === 'object') {
      (style['styleSheet' as keyof typeof style] as unknown as CSSRule).cssText = content;
    } else {
      style.appendChild(document.createTextNode(content));
    }

    appendToElement.appendChild(style);

    return style;
  }

  public static isHostMethod(obj: any, method: string): boolean {
    if (!obj) {
      return false;
    }

    const t: string = typeof obj[method];

    return CommonUtility.reUnknown.test(t) || (CommonUtility.reMethod.test(t) && Boolean(obj)) || false;
  }

  public static isRealObjectProperty(o: any, p: string): boolean {
    return Boolean(typeof o[p] === 'object' && o[p]);
  }

  public static isHtmlElement(el: HTMLElement | Element | Node | null): boolean {
    if (el === null) {
      return false;
    }

    try {
      return el instanceof Element || el instanceof Document;
    } catch (t) {
      return (
        typeof el === 'object' &&
        el.nodeType === Node.ELEMENT_NODE &&
        typeof (el as any).style === 'object' &&
        typeof el.ownerDocument === 'object'
      );
    }
  }

  public static getStyle(element: Element, styleProp: string, pseudoElt?: string): string | null {
    const isHtmlElement: boolean = CommonUtility.isHtmlElement(element);

    if (isHtmlElement === false) {
      return null;
    }

    if (CommonUtility.isHostMethod(window, 'getComputedStyle')) {
      return window.getComputedStyle(element, pseudoElt || null).getPropertyValue(styleProp);
    }

    if (CommonUtility.isRealObjectProperty(document, 'defaultView')) {
      return document && document.defaultView && document.defaultView.getComputedStyle(element, pseudoElt || null).getPropertyValue(styleProp);
    }

    return null;
  }

  public static getLanguageForTranslations(): string {
    let language: string = 'en';

    if (typeof document.documentElement.lang === 'string' && document.documentElement.lang.split('-')[0] === 'cs') {
      language = 'cs';
    } else if (typeof window.navigator.language === 'string' && window.navigator.language.length > 0) {
      language = window.navigator.language;
    } else if (Array.isArray(window.navigator.languages) && window.navigator.languages.length > 0) {
      language = window.navigator.languages[0];
    }

    return language.split('-')[0];
  }

  public static getHighestZindex(): number {
    const elms: HTMLCollectionOf<Element> = document.getElementsByTagName('*');
    const len: number = elms.length;
    const zIndexes: number[] = [];
    let zIndex: string | null;

    for (let i: number = 0; i < len; i += 1) {
      zIndex = CommonUtility.getStyle(elms[i] as HTMLElement, 'z-index');

      if (zIndex !== null && zIndex !== 'auto') {
        zIndexes.push(Number(zIndex));
      }
    }

    if (zIndexes.length === 0) {
      return 0;
    }

    return Math.max(...zIndexes);
  }

  public static async getPageResponseHeaders(header?: string): Promise<IHttpHeader[]> {
    const response: Response = await window.fetch(document.location.href, {
      body: null,
      method: 'HEAD'
    });

    const responseHeaders: IHttpHeader[] = [];

    response.headers.forEach((value: string, key: string): void => {
      responseHeaders.push({
        [key.toLowerCase()]: value
      });
    });

    if (typeof header === 'string') {
      return responseHeaders.filter((httpHeader: IHttpHeader): boolean => {
        return typeof httpHeader[header] === 'string';
      });
    }

    return responseHeaders;
  }

  public static async fetchData(): Promise<string> {
    const httpResponseHeaders: IHttpHeader[] = await CommonUtility.getPageResponseHeaders();
    const lastModifiedHttpHeader: IHttpHeader | undefined = httpResponseHeaders.find((httpHeader: IHttpHeader): boolean => {
      return typeof httpHeader['last-modified'] === 'string';
    });

    const dateHttpHeader: IHttpHeader | undefined = httpResponseHeaders.find((httpHeader: IHttpHeader): boolean => {
      return typeof httpHeader.date === 'string';
    });

    let currentHttpLastModified: number = 0;

    if (lastModifiedHttpHeader) {
      currentHttpLastModified = new Date(lastModifiedHttpHeader['last-modified']).getTime();
    } else if (dateHttpHeader) {
      currentHttpLastModified = new Date(dateHttpHeader.date).getTime();
    }

    const dataFromStorage: string | null = window.localStorage.getItem(config.APP.NAME);
    let data: IStorageData | null = null;

    if (dataFromStorage) {
      data = JSON.parse(dataFromStorage);
    }

    if (data === null || typeof data.lastModified === 'undefined') {
      window.localStorage.clear();
    }

    let content: string = '';

    if (dataFromStorage && typeof data?.lastModified === 'number' && currentHttpLastModified > data?.lastModified) {
      content = data.content;
    } else {
      try {
        const requestInfo: RequestInfo = 'https://www.coi.cz/pro-spotrebitele/rizikove-e-shopy/';
        const response: Response = await window.fetch(requestInfo);

        content = await response.text();

        const dataToStore: string = JSON.stringify({
          content: content,
          lastModified: currentHttpLastModified
        } as IStorageData);

        window.localStorage.setItem(config.APP.NAME, dataToStore);

      } catch (e) { /* empty */ }
    }

    return content;
  }

}
