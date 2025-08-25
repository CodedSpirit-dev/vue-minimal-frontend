# 🧑‍💻 Guías de Desarrollo - PostgreSQL .NET API Frontend

Este proyecto frontend sigue **Vue 3** con **Vite** y utiliza **Feature-Sliced Design (FSD)** para modularidad, escalabilidad y separación clara de responsabilidades.

Usa estas reglas y estándares de código para asegurar consistencia en todo el proyecto:

---

## 🔧 Estilo de Código y Estructura

- Escribe **TypeScript** conciso, expresivo e idiomático
- Usa patrones de **programación funcional** (evita clases y efectos secundarios)
- Prefiere **composición** sobre herencia, y modularización sobre duplicación
- Organiza cada `feature/`, `entity/`, o `widget/` con:
  - `composables/` → lógica de negocio (composables de Vue, stores de Pinia)
  - `schema/` → esquemas Zod para validación
  - `components/` → componentes Vue (SFC)
  - `lib/` → funciones auxiliares puras
  - `types/` → interfaces y tipos de TypeScript

- Todas las dependencias externas (**API**, `localStorage`, `Date`) deben estar **abstraídas** en `shared/lib/`
- Evita llamadas directas a:
  - `fetch` → usa abstracción en `shared/api/`
  - `new Date()` → usa abstracción en `shared/lib/date`
  - `localStorage` → envuelve en `shared/lib/storage`

---

## 📦 Dependencias Recomendadas

Para implementar shared data similar a Inertia.js y seguir las guías:

```bash
# Core dependencies
bun add zod @vueuse/core axios

# UI dependencies
bun add @headlessui/vue @heroicons/vue tailwindcss

# Development
bun add -D @types/node autoprefixer postcss
```

---

## 🧠 Convenciones de Nomenclatura

- Usa `kebab-case` para **directorios** (ej. `features/auth/login`)
- Usa **exports nombrados** para composables y utilidades
- Usa nombres descriptivos con **verbos auxiliares** (ej. `isLoading`, `hasError`, `canSubmit`)
- Componentes:
  - UI pura: `src/shared/ui/`
  - Lógica compartida: `src/shared/lib/`
  - Composición: `src/widgets/`

---

## 📐 Uso de TypeScript

- Usa `interface` sobre `type` para objetos
- Evita `enum`; usa mapas de objetos `as const` en su lugar
- Usa `infer` y `z.infer<typeof schema>` para tipos precisos de formularios
- Los tipos viven en `types/` o colocados junto al uso

---

## 📦 Arquitectura FSD + Shared Data Pattern

### Estructura del Proyecto

```
src/
├── app/                    # Configuración de la aplicación
│   ├── main.ts
│   ├── router.ts
│   └── store.ts
├── pages/                  # Páginas/Rutas principales
│   ├── auth/
│   │   ├── LoginPage.vue
│   │   └── RegisterPage.vue
│   ├── users/
│   │   ├── UsersListPage.vue
│   │   └── UserDetailPage.vue
│   └── HomePage.vue
├── widgets/                # Widgets complejos
│   ├── auth-form/
│   ├── user-table/
│   └── navigation-menu/
├── features/               # Features de negocio
│   ├── auth/
│   │   ├── login/
│   │   │   ├── components/
│   │   │   │   └── LoginForm.vue
│   │   │   ├── composables/
│   │   │   │   └── useLogin.ts
│   │   │   ├── schema/
│   │   │   │   └── login.schema.ts
│   │   │   └── types/
│   │   │       └── login.types.ts
│   │   ├── register/
│   │   └── logout/
│   └── users/
│       ├── list-users/
│       ├── create-user/
│       ├── update-user/
│       └── delete-user/
├── entities/               # Entidades de negocio
│   ├── user/
│   │   ├── model/
│   │   │   └── user.store.ts
│   │   ├── schema/
│   │   │   └── user.schema.ts
│   │   ├── types/
│   │   │   └── user.types.ts
│   │   └── lib/
│   │       └── user.utils.ts
│   └── session/
│       ├── model/
│       │   └── session.store.ts
│       └── schema/
│           └── session.schema.ts
└── shared/                 # Recursos compartidos
    ├── api/                # Cliente API y configuración
    │   ├── client.ts
    │   ├── auth.api.ts
    │   └── users.api.ts
    ├── lib/                # Utilidades compartidas
    │   ├── storage.ts
    │   ├── date.ts
    │   ├── validation.ts
    │   └── shared-data.ts  # Sistema de shared data
    ├── ui/                 # Componentes UI base
    │   ├── BaseButton.vue
    │   ├── BaseInput.vue
    │   ├── BaseModal.vue
    │   └── BaseAlert.vue
    ├── constants/
    │   └── paths.ts
    └── types/
        └── api.types.ts
```

### Sistema de Shared Data (Similar a Inertia.js)

**`src/shared/lib/shared-data.ts`**

```typescript
import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'
import { z } from 'zod'

// Schema para shared data
const SharedDataSchema = z.object({
  auth: z.object({
    user: z
      .object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        role: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().optional(),
        }),
      })
      .optional(),
    token: z.string().optional(),
    isAuthenticated: z.boolean(),
  }),
  flash: z
    .object({
      success: z.string().optional(),
      error: z.string().optional(),
      info: z.string().optional(),
    })
    .optional(),
  errors: z.record(z.string(), z.string()).optional(),
})

type SharedData = z.infer<typeof SharedDataSchema>

// Store global para shared data
export const useSharedDataStore = defineStore('sharedData', () => {
  // Estado reactivo
  const _data = ref<SharedData>({
    auth: {
      user: undefined,
      token: undefined,
      isAuthenticated: false,
    },
  })

  // Getters computados
  const auth = computed(() => _data.value.auth)
  const user = computed(() => _data.value.auth.user)
  const isAuthenticated = computed(() => _data.value.auth.isAuthenticated)
  const flash = computed(() => _data.value.flash)
  const errors = computed(() => _data.value.errors)

  // Actions
  function setSharedData(data: Partial<SharedData>) {
    // Validar con Zod antes de setear
    const validated = SharedDataSchema.partial().parse(data)
    _data.value = { ..._data.value, ...validated }
  }

  function setAuth(authData: SharedData['auth']) {
    _data.value.auth = { ..._data.value.auth, ...authData }
  }

  function setFlash(flashData: SharedData['flash']) {
    _data.value.flash = flashData
  }

  function setErrors(errors: Record<string, string> | undefined) {
    _data.value.errors = errors
  }

  function clearFlash() {
    _data.value.flash = undefined
  }

  function clearErrors() {
    _data.value.errors = undefined
  }

  function logout() {
    _data.value.auth = {
      user: undefined,
      token: undefined,
      isAuthenticated: false,
    }
    clearFlash()
    clearErrors()
  }

  return {
    // State (readonly)
    data: readonly(_data),
    auth,
    user,
    isAuthenticated,
    flash,
    errors,

    // Actions
    setSharedData,
    setAuth,
    setFlash,
    setErrors,
    clearFlash,
    clearErrors,
    logout,
  }
})

// Composable para usar shared data fácilmente
export function useSharedData() {
  const store = useSharedDataStore()

  return {
    auth: store.auth,
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    flash: store.flash,
    errors: store.errors,

    setAuth: store.setAuth,
    setFlash: store.setFlash,
    setErrors: store.setErrors,
    clearFlash: store.clearFlash,
    clearErrors: store.clearErrors,
    logout: store.logout,
  }
}
```

**`src/shared/api/client.ts`**

```typescript
import axios from 'axios'
import { useSharedDataStore } from '@/shared/lib/shared-data'

// Cliente API configurado
export const apiClient = axios.create({
  baseURL: 'http://localhost:5175',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use((config) => {
  const { auth } = useSharedDataStore()

  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }

  return config
})

// Interceptor para manejo de errores y shared data
apiClient.interceptors.response.use(
  (response) => {
    // Si la respuesta incluye shared data, actualizarla
    if (response.data.sharedData) {
      const { setSharedData } = useSharedDataStore()
      setSharedData(response.data.sharedData)
    }

    return response
  },
  (error) => {
    const { setErrors, setFlash, logout } = useSharedDataStore()

    // Manejo de errores 401 (no autorizado)
    if (error.response?.status === 401) {
      logout()
      setFlash({ error: 'Sesión expirada. Por favor, inicia sesión nuevamente.' })
    }

    // Manejo de errores de validación 422
    if (error.response?.status === 422) {
      setErrors(error.response.data.errors)
    }

    return Promise.reject(error)
  },
)
```

### Ejemplo de Uso en Features

**`src/features/auth/login/composables/useLogin.ts`**

```typescript
import { ref } from 'vue'
import { z } from 'zod'
import { apiClient } from '@/shared/api/client'
import { useSharedData } from '@/shared/lib/shared-data'
import { loginSchema } from '../schema/login.schema'

type LoginData = z.infer<typeof loginSchema>

export function useLogin() {
  const { setAuth, setFlash, setErrors, clearErrors } = useSharedData()
  const isLoading = ref(false)

  async function login(credentials: LoginData) {
    try {
      clearErrors()
      isLoading.value = true

      // Validar datos antes de enviar
      const validatedData = loginSchema.parse(credentials)

      const response = await apiClient.post('/auth/login', validatedData)

      // Actualizar shared data con la respuesta
      setAuth({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
      })

      setFlash({ success: 'Login exitoso' })

      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrors({ email: 'Credenciales incorrectas' })
      } else if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.reduce(
          (acc, err) => {
            acc[err.path.join('.')] = err.message
            return acc
          },
          {} as Record<string, string>,
        )
        setErrors(formattedErrors)
      }

      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    login,
    isLoading: readonly(isLoading),
  }
}
```

**`src/features/auth/login/components/LoginForm.vue`**

```vue
<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Flash Messages -->
    <BaseAlert v-if="flash?.success" type="success" :message="flash.success" @close="clearFlash" />

    <BaseAlert v-if="flash?.error" type="error" :message="flash.error" @close="clearFlash" />

    <!-- Email Field -->
    <BaseInput v-model="form.email" label="Email" type="email" :error="errors?.email" required />

    <!-- Password Field -->
    <BaseInput
      v-model="form.password"
      label="Contraseña"
      type="password"
      :error="errors?.password"
      required
    />

    <!-- Submit Button -->
    <BaseButton type="submit" :loading="isLoading" class="w-full"> Iniciar Sesión </BaseButton>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useLogin } from '../composables/useLogin'
import { useSharedData } from '@/shared/lib/shared-data'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseAlert from '@/shared/ui/BaseAlert.vue'

const router = useRouter()
const { login, isLoading } = useLogin()
const { flash, errors, clearFlash } = useSharedData()

const form = reactive({
  email: '',
  password: '',
})

async function handleSubmit() {
  try {
    await login(form)
    router.push('/users')
  } catch (error) {
    // Errors are handled by the composable and shared data
    console.error('Login failed:', error)
  }
}
</script>
```

---

## 🧪 Manejo de Errores y Validación

- Usa **Zod** para validación de esquemas
- Prefiere returns tempranos y cláusulas de guardia
- Usa **shared data store** para errores consistentes
- Muestra errores amigables vía componentes `<BaseAlert />`
- Centraliza el manejo de errores en interceptors de axios

---

## 💅 UI y Estilos

- Usa **Headless UI**, **Heroicons**, y **Tailwind CSS** con diseño **mobile-first** responsivo
- Tema de diseño:
  - **Minimalista**, profesional con un **toque ligeramente divertido**
  - Inspirado en **Apple**, adaptado para APIs y desarrollo
  - Enfatiza visuales: badges, barras de progreso, ilustraciones
  - Usa iconos de **Heroicons**, bordes sutiles, feedback hover
  - Evita drop shadows; prefiere bordes ligeros y efectos hover suaves

- Animaciones:
  - Elegantes y performantes (usa `@vueuse/core` si es necesario)
  - Usa `transition`, `duration-xxx`, y `ease-xxx` de Tailwind

- Principios UX:
  - Jerarquía clara
  - Responsivo: sin overflow, sin superposición
  - Todos los botones y elementos interactivos deben dar feedback
  - Usa la configuración de tema de Tailwind

- **Stack UI**:
  - **Headless UI**, y **Tailwind CSS** (enfoque mobile-first)
  - Iconos: **Heroicons**

- **Lenguaje de Diseño**:
  - 🎨 **Moderno y minimalista**, inspirado en el **sistema de diseño de Apple**, con una **paleta ligeramente más colorida**
  - La interfaz debe ser **limpia**, **cohesiva** y **funcional** sin sacrificar características
  - Evita drop shadows; prefiere **bordes sutiles** donde sea relevante
  - Asegura una **jerarquía visual clara** y **navegación intuitiva**

- **Componentes Interactivos**:
  - Botones e inputs deben ser **elegantes**, con **feedback visual sutil** (hover, click, validación)
  - Usa **micro-interacciones** moderadamente para mejorar engagement sin saturar

- **Animaciones**:
  - Usa utilidades incorporadas de Tailwind: `transition`, `duration-xxx`, `ease-xxx` para transiciones básicas
  - Usa `@vueuse/core` para animaciones avanzadas solo si es necesario
  - ✅ **Performance primero**: las animaciones deben ser suaves y ligeras

- **Responsividad**:
  - Layout completamente responsivo: **sin superposición**, **sin overflow**
  - Comportamiento consistente en todos los dispositivos, de móvil a desktop

- **Experiencia de Usuario**:
  - Todos los elementos interactivos deben proveer **feedback visual claro**
  - Las interfaces deben permanecer **simples de navegar**, incluso cuando son **ricas en características**

---

## 🧱 Renderizado y Performance

- Favorece **componentes reutilizables** y composición
- Usa `<Suspense>` para carga asíncrona cuando sea necesario
- Usa importación dinámica para UI no crítica (ej. `BaseModal`, `Chart`)
- Optimiza media:
  - Usa imágenes **WebP** con width/height
  - Habilita lazy loading donde sea posible

---

## 🔍 Datos, Formularios y APIs

- Usa **Pinia** para estado global
- Usa **axios** con interceptors para llamadas a API
- Usa **Zod** para validación de formularios y APIs
- Todos los composables de API deben:
  - Tener esquema claro (`schema/`)
  - Manejar errores esperados con shared data
  - Retornar output tipado
  - Usar abstracción de API en `shared/api/`

---

## 🧭 Enrutamiento y Navegación

- Todas las rutas definidas en `src/app/router.ts`
- Usa constantes en `src/shared/constants/paths.ts`
- Para parámetros de búsqueda, usa `useRoute()` y `useRouter()` de Vue Router
- Sigue estándares de Vue Router para guards y navigation

---

## 🛠️ Stack Tecnológico Completo

- **Runtime**: Bun
- **Framework**: Vue 3 + Vite
- **UI**: Headless UI + Tailwind CSS
- **Estado**: Pinia
- **HTTP**: Axios
- **Validación**: Zod
- **Iconos**: Heroicons
- **Utilidades**: @vueuse/core
- **Testing**: Vitest + Cypress

---

## 📚 Referencias

- [Feature-Sliced Design](https://feature-sliced.design/)
- [Vue 3](https://vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Zod](https://zod.dev/)
- [Headless UI](https://headlessui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [@vueuse/core](https://vueuse.org/)

---

**Nota**: Este frontend está diseñado para consumir la API REST de PostgreSQL .NET y replicar la experiencia de shared data de Inertia.js usando Pinia + Zod para validación y estado reactivo centralizado.
