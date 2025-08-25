import { defineStore } from 'pinia'
export const useSession = defineStore('session', {
  state: () => ({ token: localStorage.getItem('token') as string | null }),
  actions: {
    setToken(t: string | null) {
      this.token = t
      t ? localStorage.setItem('token', t) : localStorage.removeItem('token')
    },
    forceLogout() {
      this.setToken(null)
      location.assign('/auth/login')
    },
  },
})
