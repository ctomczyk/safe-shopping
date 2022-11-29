import './polyfills';
import styles from '../dist/styles.bundle.css';
import { IHttpHeader, ITranslation } from './interfaces/interfaces';
import { CommonUtility } from './utils/common.utility';
import { translations } from './translations/translations';

class ContentScript {
  private elementMessageId: string;

  constructor() {
    this.elementMessageId = 'safeShoppingMessage';
  }

  private initialiseLayout(): void {
    if (typeof window.sessionStorage.getItem('safeShopping') === 'string') {
      return;
    }

    const el: HTMLDivElement = document.createElement('div');
    const existingMessage: HTMLElement | null = document.getElementById(this.elementMessageId);

    if (existingMessage) {
      return;
    }

    el.className = 'safe-alert-message';
    el.id = this.elementMessageId;
    el.setAttribute('role', 'alert');
    el.setAttribute('tabindex', '-1');
    el.style.zIndex = String(CommonUtility.getHighestZindex() + 1);

    const languageForTranslations: string = CommonUtility.getLanguageForTranslations();
    const currentTranslations: ITranslation = typeof translations[languageForTranslations] === 'undefined' ? translations.en : translations[languageForTranslations];

    el.setAttribute('lang', languageForTranslations);

    el.innerHTML = `<div><a href="https://www.coi.cz/pro-spotrebitele/rizikove-e-shopy/" target="_blank" rel="noopener" aria-describedby="opens-an-external-site-in-new-window">${currentTranslations.message}</a><button type="button">${currentTranslations.actionClose}</button></div>
    <span hidden>
      <span id="opens-an-external-site-in-new-window">${currentTranslations.openNewUrl}</span>
    </span>`;

    document.body.appendChild(el);

    const styleElementId: string = 'safe_shopping_styles';

    try {
      CommonUtility.createCSS(styles, document.head, styleElementId);
    } catch (e) { /* empty */ }

    const button: HTMLButtonElement | null = el.querySelector('button');

    const removeMessage = (): void => {
      button?.removeEventListener('click', removeMessage);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      document.body.removeEventListener('click', removeMessageOnOutsideClick);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      document.body.removeEventListener('keydown', removeMessageOnOutsideClick);

      el.remove();
      document.querySelector(`#${styleElementId}`)?.remove();
    };

    const removeMessageOnOutsideClick = (event: Event): void => {
      if (event.type === 'keydown') {
        if ((typeof (event as KeyboardEvent).key === 'string' && (event as KeyboardEvent).key !== 'Escape') || (typeof (event as KeyboardEvent).code === 'string' && (event as KeyboardEvent).code !== 'Escape')) {
          return;
        }

        removeMessage();
        event.preventDefault();

        return;
      }

      const eventTarget: HTMLElement = event.target as HTMLElement;
      const messageContainer: HTMLElement | null = eventTarget.closest(`#${this.elementMessageId}`);

      if (messageContainer) {
        return;
      }

      removeMessage();
    };

    button?.addEventListener('click', removeMessage);
    document.body.addEventListener('click', removeMessageOnOutsideClick);
    document.body.addEventListener('keydown', removeMessageOnOutsideClick);

    window.sessionStorage.setItem('safeShopping', 'installed');

    window.setTimeout((): void => {
      el?.focus();
    }, 500);
  }

  public async evaluateSiteHostname(): Promise<void> {

    const parseData = (html: string): void => {
      const parsedDOM: Document = new DOMParser().parseFromString(html, 'text/html' as DOMParserSupportedType);
      const elementsWithDomain: Element[] = Array.from(parsedDOM.querySelectorAll('.information-row .entry-content .list_titles span'));

      const getHostName = (element: Element): string => {
        return element.textContent ? element.textContent : '';
      };

      const skipEmptyHostName = (hostName: string): boolean => {
        return hostName.length > 0;
      };

      const allDomains: string[] = elementsWithDomain.map(getHostName).filter(skipEmptyHostName);
      const findDomain: boolean = allDomains.some((hostName: string): boolean => {
        return hostName.includes(location.hostname) || location.hostname.includes(hostName);
      });

      if (findDomain === false) {
        return;
      }

      window.setTimeout((): void => {
        this.initialiseLayout();
      }, 3500);
    };

    const handleError = (err: unknown): void => {
      console.debug('[SafeShopping]', err);
    };

    const httpResponseHeaders: IHttpHeader[] = await CommonUtility.getPageResponseHeaders();
    const lastModifiedHttpHeader: IHttpHeader | undefined = httpResponseHeaders.find((httpHeader: IHttpHeader): boolean => {
      return typeof httpHeader['last-modified'] === 'string';
    });

    const dateHttpHeader: IHttpHeader | undefined = httpResponseHeaders.find((httpHeader: IHttpHeader): boolean => {
      return typeof httpHeader.date === 'string';
    });

    if (lastModifiedHttpHeader) {
      console.log('lastModified', new Date(lastModifiedHttpHeader['last-modified']).getTime());
      CommonUtility.fetchData();
    } else if (dateHttpHeader) {
      CommonUtility.fetchData();
    }

    let data: string = '';

    try {
      data = await CommonUtility.fetchData();
    } catch (e) {
      handleError(e);
    }

    parseData(data);
  }
}

const contentScript: ContentScript = new ContentScript();

contentScript.evaluateSiteHostname();
