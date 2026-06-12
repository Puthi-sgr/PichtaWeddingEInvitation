# Local React App Architecture (Atomic + Feature Folders)

## 1. Folder Structure

```txt
src/
  app/
    App.tsx
    router.tsx
    providers.tsx

  shared/
    hooks/
      useDebounce.ts
      useLocalStorage.ts
    ui/
      atoms/
        Button/
        Input/
        Badge/
      molecules/
        FormField/
        ModalDialog/
      organisms/
        Navbar/
        Sidebar/
      templates/
        DashboardLayout/
        AuthLayout/
    types/
      global.ts

  features/
    counter/
      hooks/
        useCounter.ts
      components/
        CounterDisplay.tsx
        CounterControls.tsx
      pages/
        CounterPage.tsx
      types.ts

    auth/
      hooks/
        useAuth.ts
      components/
        LoginForm.tsx
      pages/
        LoginPage.tsx
      types.ts

  assets/
  main.tsx
```

---

## 2. Component & Data Flow

```txt
Page (route)
  -> feature hook (local state, events)
    -> returns state + handlers
  -> passes props down to feature components
    -> components emit events back to hook
```

* **Props down, events up**
* **Single source of truth** in feature hook or shared context
* No API calls needed, all data is local

---

## 3. Atomic Design Guidelines

| Level    | Meaning                      | Examples                           |
| -------- | ---------------------------- | ---------------------------------- |
| Atom     | Smallest reusable UI element | Button, Input, Badge               |
| Molecule | Group of atoms               | FormField, SearchBox, ToggleSwitch |
| Organism | Bigger UI section            | Navbar, Sidebar, DataTable         |
| Template | Layout skeleton              | DashboardLayout, AuthLayout        |
| Page     | Route-level component        | LoginPage, CounterPage             |

**Rule:** Only put **purely reusable components** into `shared/ui`. Feature-specific components belong in their feature folder.

---

## 4. Hooks Organization

```txt
Shared generic hooks       -> shared/hooks
Feature-specific hooks     -> features/<feature>/hooks
```

Example:

```ts
// features/counter/hooks/useCounter.ts
import { useState } from "react";

export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  return {
    count,
    increment: () => setCount((c) => c + 1),
    decrement: () => setCount((c) => c - 1),
    reset: () => setCount(initial)
  };
}
```

---

## 5. State Management Guidelines

| Type                 | Recommended Tool      |
| -------------------- | --------------------- |
| Component-only state | useState              |
| Complex local state  | useReducer            |
| Shared app state     | Context / Zustand     |
| Form state           | React Hook Form + Zod |

---

## 6. Pages and Feature Example

**Counter Page Flow:**

```tsx
// features/counter/pages/CounterPage.tsx
import { useCounter } from "../hooks/useCounter";
import { CounterDisplay, CounterControls } from "../components";

export function CounterPage() {
  const counter = useCounter();

  return (
    <div>
      <h1>Counter</h1>
      <CounterDisplay value={counter.count} />
      <CounterControls
        increment={counter.increment}
        decrement={counter.decrement}
        reset={counter.reset}
      />
    </div>
  );
}
```

---

## 7. External Libraries (Optional)

Even for local apps, these can improve UX:

* Routing: `react-router-dom`
* State: React Context / Zustand
* Forms & validation: `react-hook-form` + `zod`
* UI: Tailwind CSS, `clsx` or `tailwind-merge`
* Memoization: `useMemo`, `useCallback`

---

## 8. Guidelines & Best Practices

* **Do not** put feature-specific components in `shared/ui`.
* **Do not** fetch data in atoms or molecules.
* **Use feature hooks** to encapsulate all logic/state.
* Keep **page-level components** responsible for wiring hooks → components → layout.
* Clean up side effects in `useEffect` (or `onUnmounted` if Vue) to avoid memory leaks.
