import './assets/main.css'
import 'primeicons/primeicons.css'
import { setTokenProvider } from '@shared/api/http'
import { useSession } from '@entities/session/model/store'

setTokenProvider(() => useSession().token)

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './app/providers/router'
import { PrimeVue } from '@primevue/core'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, { unstyled: true })

app.mount('#app')
