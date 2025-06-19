import { createSSRApp } from 'vue'
import App from './App'
import request from './common/request';
import emotion from './common/emotion.js';
import * as  enums from './common/enums.js';
import * as date from './common/date';
import * as socketApi from './common/wssocket';
import store from './store';
import { installI18n } from './i18n'
import LanguageSwitchTransition from './components/language-switch-transition/index.vue'

// #ifdef H5
import * as recorder from './common/recorder-h5';
// #endif
// #ifndef H5
import * as recorder from './common/recorder-app';
// #endif


export function createApp() {
  const app = createSSRApp(App)
  installI18n(app);
  app.use(store);
  app.component('LanguageSwitchTransition', LanguageSwitchTransition)
  app.config.globalProperties.$http = request;
  app.config.globalProperties.$wsApi = socketApi;
  app.config.globalProperties.$emo = emotion;
  app.config.globalProperties.$enums = enums;
  app.config.globalProperties.$date = date;
  app.config.globalProperties.$rc = recorder;
  return {
    app
  }
}