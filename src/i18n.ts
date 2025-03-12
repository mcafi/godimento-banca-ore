import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import it from './locales/it/translation.json';

const resources = {
    it: {
        translation: it,
    }
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'it',
        lng: 'it',
        debug: true,
    });


export default i18n;