import { ref } from 'vue'
import { postLogin } from '../api/index'
import { setTokenProvider } from '@shared/api/http'

export const useLogin = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const submit = async (usernameOrEmail: string, password: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await postLogin({ usernameOrEmail, password })

      if (response.token) {
        // Store token in localStorage
        localStorage.setItem('auth-token', response.token)

        // Update the token provider for future API calls
        setTokenProvider(() => localStorage.getItem('auth-token'))

        // Store user data if needed
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user))
        }
      }

      return response
    } catch (err) {
      let errorMessage = 'Error de login desconocido'

      if (err instanceof Error) {
        if (err.message === 'UNAUTHORIZED') {
          errorMessage = 'Credenciales inválidas'
        } else if (err.message.startsWith('HTTP_')) {
          errorMessage = 'Error del servidor'
        } else {
          errorMessage = err.message
        }
      }

      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    submit,
  }
}
