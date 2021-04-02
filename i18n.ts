import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import i18nHttpLoader from 'i18next-http-backend';
import de from './assets/translations/de';
import flanoApi from './src/api/flanoApi';

// the local translations
// (tip move them in a JSON file and import them)
const resources = {
    de: de,
};

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .use(i18nHttpLoader)
    .init({
        resources, // use local resources for important labels (e.g. error messages, navigation, ...)
        lng: 'de',
        keySeparator: false, // we do not use keys in form messages.welcome
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        fallbackLng: 'de',
        react: {
            useSuspense: false,
        },
        backend: {
            // load translation from backend
            loadPath: flanoApi.defaults.baseURL + '/translations/?locale=de',
            parse: (data: string) => {
                return data;
            },
            //@ts-ignore
            request: (options, url, payload, callback) => {
                flanoApi
                    .get('/translations/', {
                        params: {
                            locale: 'de',
                        },
                    })
                    .then(res => {
                        console.log('fetched translations from backend');
                        callback(null, res);
                    })
                    .catch(err => {
                        //TODO error handling (what if server is not reachable?)
                        console.log(err);
                        callback(err, null);
                    });
            },
        },
    })
    .then(() => {
        console.log('i18n initialized');
        // reload resources to enable translations fetched from backend
        i18n.reloadResources();
        console.log('reloaded i18n resources');
    });

export default i18n;
