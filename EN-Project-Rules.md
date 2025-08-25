# 🧑‍💻 Development Guides - PostgreSQL .NET API Frontend

This frontend project follows **Vue 3** with **Vite** and uses **Feature-Sliced Design (FSD)** for modularity, scalability, and clear separation of concerns.

Use these rules and code standards to ensure consistency throughout the project:

---

## 🔧 Code Style and Structure

- Write concise, expressive, and idiomatic **TypeScript**
- Use **functional programming** patterns (avoid classes and side effects)
- Prefer **composition** over inheritance, and modularization over duplication
- Organize each `feature/`, `entity/`, or `widget/` with:

  - `composables/` → business logic (Vue composables, Pinia stores)
  - `schema/` → Zod schemas for validation
  - `components/` → Vue components (SFC)
  - `lib/` → pure helper functions
  - `types/` → TypeScript interfaces and types

- All external dependencies (**API**, `localStorage`, `Date`) must be **abstracted** in `shared/lib/`
- Avoid direct calls to:
    - `fetch` → use abstraction in `shared/api/`
    - `new Date()` → use abstraction in `shared/lib/date`
    - `localStorage` → wrap in `shared/lib/storage`

---

## 📦 Recommended Dependencies

To implement shared data similar to Inertia.js and follow the guides:

```bash
# Core dependencies
bun add zod @vueuse/core axios

# UI dependencies  
bun add @headlessui/vue @heroicons/vue tailwindcss

# Development
bun add -D @types/node autoprefixer postcss
```

---

## 🧠 Naming Conventions

- Use `kebab-case` for **directories** (e.g., `features/auth/login`)
- Use **named exports** for composables and utilities
- Use descriptive names with **auxiliary verbs** (e.g., `isLoading`, `hasError`, `canSubmit`)
- Components:
    - Pure UI: `src/shared/ui/`
    - Shared logic: `src/shared/lib/`
    - Composition: `src/widgets/`

---

## 📐 TypeScript Usage

- Use `interface` over `type` for objects
- Avoid `enum`; use object maps `as const` instead
- Use `infer` and `z.infer<typeof schema>` for precise form types
- Types live in `types/` or are collocated with usage

---

## 📦 FSD Architecture + Shared Data Pattern

### Project Structure

```
src/
├── app/                    # Application configuration
│   ├── main.ts
│   ├── router.ts
│   └── store.ts
├── pages/                  # Main pages/routes
│   ├── auth/
│   │   ├── LoginPage.vue
│   │   └── RegisterPage.vue
│   ├── users/
│   │   ├── UsersListPage.vue
│   │   └── UserDetailPage.vue
│   └── HomePage.vue
├── widgets/                # Complex widgets
│   ├── auth-form/
│   ├── user-table/
│   └── navigation-menu/
├── features/               # Business features
│   ├── auth/
│   │   ├── login/
│   │   │   ├── components/
│   │   │   │   └── LoginForm.vue
│   │   │   ├── composables/
│   │   │   │   └── useLogin.ts
│   │   │   ├── schema/
│   │   │   │   └── login.schema.ts
│   │   │   └── types/
│   │   │       └── login.types.ts
│   │   ├── register/
│   │   └── logout/
│   └── users/
│       ├── list-users/
│       ├── create-user/
│       ├── update-user/
│       └── delete-user/
├── entities/               # Business entities
│   ├── user/
│   │   ├── model/
│   │   │   └── user.store.ts
│   │   ├── schema/
│   │   │   └── user.schema.ts
│   │   ├── types/
│   │   │   └── user.types.ts
│   │   └── lib/
│   │       └── user.utils.ts
│   └── session/
│       ├── model/
│       │   └── session.store.ts
│       └── schema/
│           └── session.schema.ts
└── shared/                 # Shared resources
    ├── api/                # API client and configuration
    │   ├── client.ts
    │   ├── auth.api.ts
    │   └── users.api.ts
    ├── lib/                # Shared utilities
    │   ├── storage.ts
    │   ├── date.ts
    │   ├── validation.ts
    │   └── shared-data.ts  # Shared data system
    ├── ui/                 # Base UI components
    │   ├── BaseButton.vue
    │   ├── BaseInput.vue
    │   ├── BaseModal.vue
    │   └── BaseAlert.vue
    ├── constants/
    │   └── paths.ts
    └── types/
        └── api.types.ts
```

### Shared Data System (Similar to Inertia.js)

**`src/shared/lib/shared-data.ts`**

```typescript
import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'
import { z } from 'zod'

// Shared data schema
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

// Global store for shared data
export const useSharedDataStore = defineStore('sharedData', () => {
  // Reactive state
  const _data = ref<SharedData>({
    auth: {
      user: undefined,
      token: undefined,
      isAuthenticated: false,
    },
  }) // Computed getters

  const auth = computed(() => _data.value.auth)
  const user = computed(() => _data.value.auth.user)
  const isAuthenticated = computed(() => _data.value.auth.isAuthenticated)
  const flash = computed(() => _data.value.flash)
  const errors = computed(() => _data.value.errors) // Actions

  function setSharedData(data: Partial<SharedData>) {
    // Validate with Zod before setting
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
    errors, // Actions
    setSharedData,
    setAuth,
    setFlash,
    setErrors,
    clearFlash,
    clearErrors,
    logout,
  }
})

// Composable to easily use shared data
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

// Configured API client
export const apiClient = axios.create({
  baseURL: 'http://localhost:5175',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor to automatically add token
apiClient.interceptors.request.use((config) => {
  const { auth } = useSharedDataStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// Interceptor for error and shared data handling
apiClient.interceptors.response.use(
  (response) => {
    // If the response includes shared data, update it
    if (response.data.sharedData) {
      const { setSharedData } = useSharedDataStore()
      setSharedData(response.data.sharedData)
    }
    return response
  },
  (error) => {
    const { setErrors, setFlash, logout } = useSharedDataStore() // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      logout()
      setFlash({ error: 'Session expired. Please log in again.' })
    } // Handle 422 validation errors
    if (error.response?.status === 422) {
      setErrors(error.response.data.errors)
    }
    return Promise.reject(error)
  },
)
```

### Example of Usage in Features

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
      isLoading.value = true // Validate data before sending
      const validatedData = loginSchema.parse(credentials)
      const response = await apiClient.post('/auth/login', validatedData) // Update shared data with the response
      setAuth({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
      })
      setFlash({ success: 'Login successful' })
      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrors({ email: 'Incorrect credentials' })
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
           
    <BaseAlert v-if="flash?.success" type="success" :message="flash.success" @close="clearFlash" />
           
    <BaseAlert v-if="flash?.error" type="error" :message="flash.error" @close="clearFlash" />

           
    <BaseInput v-model="form.email" label="Email" type="email" :error="errors?.email" required />

           
    <BaseInput
      v-model="form.password"
      label="Password"
      type="password"
      :error="errors?.password"
      required
    />

           
    <BaseButton type="submit" :loading="isLoading" class="w-full">       Log In     </BaseButton>  
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

## 🧪 Error and Validation Handling

- Use **Zod** for schema validation
- Prefer early returns and guard clauses
- Use the **shared data store** for consistent errors
- Show user-friendly errors via `<BaseAlert />` components
- Centralize error handling in Axios interceptors

---

## 💅 UI and Styles

- Use **Headless UI**, **Heroicons**, and **Tailwind CSS** with a responsive **mobile-first** design
- Design theme:

  - **Minimalist**, professional with a **slightly playful touch**
  - Inspired by **Apple**, adapted for APIs and development
  - Emphasizes visuals: badges, progress bars, illustrations
  - Uses **Heroicons**, subtle borders, hover feedback
  - Avoids drop shadows; prefers light borders and soft hover effects

- Animations:

  - Elegant and performant (use `@vueuse/core` if necessary)
  - Use Tailwind's `transition`, `duration-xxx`, and `ease-xxx`

- UX Principles:

  - Clear hierarchy
  - Responsive: no overflow, no overlapping
  - All interactive elements must provide feedback
  - Use Tailwind's theme configuration

- **UI Stack**:

  - **Headless UI**, and **Tailwind CSS** (mobile-first approach)
  - Icons: **Heroicons**

- **Design Language**:

  - 🎨 **Modern and minimalist**, inspired by the **Apple design system**, with a **slightly more colorful palette**
  - The interface must be **clean**, **cohesive**, and **functional** without sacrificing features
  - Avoid drop shadows; prefer **subtle borders** where relevant
  - Ensure a **clear visual hierarchy** and **intuitive navigation**

- **Interactive Components**:

  - Buttons and inputs should be **elegant**, with **subtle visual feedback** (hover, click, validation)
  - Use **micro-interactions** moderately to enhance engagement without overwhelming

- **Animations**:

  - Use built-in Tailwind utilities: `transition`, `duration-xxx`, `ease-xxx` for basic transitions
  - Use `@vueuse/core` for advanced animations only if necessary
  - ✅ **Performance first**: animations must be smooth and lightweight

- **Responsiveness**:

  - Fully responsive layout: **no overlapping**, **no overflow**
  - Consistent behavior across all devices, from mobile to desktop

- **User Experience**:
    - All interactive elements must provide **clear visual feedback**
    - Interfaces must remain **simple to navigate**, even when they are **feature-rich**

---

## 🧱 Rendering and Performance

- Favor **reusable components** and composition
- Use `<Suspense>` for asynchronous loading when needed
- Use dynamic imports for non-critical UI (e.g., `BaseModal`, `Chart`)
- Optimize media:
    - Use **WebP** images with width/height
    - Enable lazy loading where possible

---

## 🔍 Data, Forms, and APIs

- Use **Pinia** for global state
- Use **axios** with interceptors for API calls
- Use **Zod** for form and API validation
- All API composables must:
    - Have a clear schema (`schema/`)
    - Handle expected errors with shared data
    - Return typed output
    - Use API abstraction in `shared/api/`

---

## 🧭 Routing and Navigation

- All routes defined in `src/app/router.ts`
- Use constants in `src/shared/constants/paths.ts`
- For search parameters, use Vue Router's `useRoute()` and `useRouter()`
- Follow Vue Router standards for guards and navigation

---

## 🛠️ Complete Tech Stack

- **Runtime**: Bun
- **Framework**: Vue 3 + Vite
- **UI**: Headless UI + Tailwind CSS  
- **State**: Pinia
- **HTTP**: Axios
- **Validation**: Zod
- **Icons**: Heroicons
- **Utilities**: @vueuse/core
- **Testing**: Vitest + Cypress

---

## 📚 References

- [Feature-Sliced Design](https://feature-sliced.design/)
- [Vue 3](https://vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Zod](https://zod.dev/)
- [Headless UI](https://headlessui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [@vueuse/core](https://vueuse.org/)

---

**Note**: This frontend is designed to consume the PostgreSQL .NET REST API and replicate the Inertia.js shared data experience using Pinia + Zod for validation and centralized reactive state.
