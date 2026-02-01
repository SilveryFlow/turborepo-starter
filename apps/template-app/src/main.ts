import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@csstools/normalize.css'

import 'virtual:uno.css'

import '@repo/ui/style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
