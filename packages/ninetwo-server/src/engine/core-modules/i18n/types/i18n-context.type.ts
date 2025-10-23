import { type APP_LOCALES } from 'ninetwo-shared/translations';
export type I18nContext = {
  req: {
    locale: keyof typeof APP_LOCALES;
  };
};
