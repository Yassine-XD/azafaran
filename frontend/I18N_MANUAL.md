# Manual de Localización (i18n) — Azafaran

## Estructura del sistema

Las traducciones viven en un único archivo:

```
frontend/lib/i18n.ts
```

El sistema soporta **3 idiomas**:

| Código | Idioma     |
|--------|------------|
| `es`   | Castellano |
| `ca`   | Català     |
| `en`   | English    |

---

## Cómo añadir o editar una traducción

### Paso 1 — Localiza la clave en `i18n.ts`

Las traducciones están organizadas en secciones. Cada idioma (`es`, `ca`, `en`) tiene **exactamente las mismas claves**.

```
language_select.*     → Pantalla de selección de idioma
onboarding.*          → Pantalla de introducción (slides)
auth.login.*          → Pantalla de inicio de sesión
auth.register.*       → Pantalla de registro
auth.profile_setup.*  → Pantalla de perfil inicial
auth.terms.*          → Pantalla de términos y condiciones
profile.*             → Pantalla de perfil (tabs)
common.*              → Textos reutilizables (Error, Cancelar…)
tabs.*                → Etiquetas de la barra de navegación
```

### Paso 2 — Edita el texto en los 3 idiomas

Siempre edita los **tres bloques** (`es`, `ca`, `en`) para mantener la consistencia.

**Ejemplo:** cambiar el botón de registro:

```typescript
// En el bloque `es`:
auth: {
  register: {
    button: "Siguiente",   // ← Cambia aquí
  }
}

// En el bloque `ca`:
auth: {
  register: {
    button: "Següent",     // ← Y aquí
  }
}

// En el bloque `en`:
auth: {
  register: {
    button: "Next",        // ← Y aquí
  }
}
```

---

## Cómo añadir una clave nueva

### 1. Añade la clave en `es` (el idioma base)

```typescript
const es = {
  // ... claves existentes ...
  mi_seccion: {
    mi_clave: "Mi texto en castellano",
  },
};
```

### 2. Añade la misma clave en `ca` y `en`

```typescript
const ca: typeof es = {
  // ... claves existentes ...
  mi_seccion: {
    mi_clave: "El meu text en català",
  },
};

const en: typeof es = {
  // ... claves existentes ...
  mi_seccion: {
    mi_clave: "My text in English",
  },
};
```

> **Nota:** La declaración `const ca: typeof es` hace que TypeScript te avise si falta alguna clave. Si olvidas una traducción verás un error en rojo.

---

## Cómo usar una traducción en un componente

### 1. Importa el hook

```typescript
import { useLang } from "@/contexts/LanguageContext";
```

### 2. Llama al hook en tu componente

```typescript
export default function MiPantalla() {
  const { t, lang } = useLang();

  return (
    <Text>{t("mi_seccion.mi_clave")}</Text>
  );
}
```

La función `t("clave.subclave")` usa **notación de punto** para acceder a claves anidadas.

### Acceder a los slides del onboarding (array)

Los slides son un array especial. Usa `getSlides()`:

```typescript
import { getSlides } from "@/lib/i18n";
import { useLang } from "@/contexts/LanguageContext";

const { lang } = useLang();
const slides = getSlides(lang);

// slides[0].title, slides[0].description
```

---

## Cambiar el idioma desde código

```typescript
const { setLang } = useLang();

// Cambia a catalán y guarda automáticamente en AsyncStorage + backend
await setLang("ca");
```

`setLang` hace dos cosas:
1. Actualiza el estado global (la UI se re-renderiza en el nuevo idioma)
2. Guarda la preferencia en `AsyncStorage` bajo la clave `"preferred_lang"`

Para sincronizar también con el backend (recomendado en la pantalla de perfil):

```typescript
await setLang("ca");
await api.put("/users/", { preferred_lang: "ca" });
```

---

## Dónde se guarda la preferencia

| Lugar         | Clave             | Cuándo se actualiza                        |
|---------------|-------------------|--------------------------------------------|
| AsyncStorage  | `preferred_lang`  | Al seleccionar idioma (language-select, perfil) |
| Base de datos | `users.preferred_lang` | Al actualizar perfil / al registrarse  |

Al **iniciar la app** el idioma se carga desde `AsyncStorage`. Al **iniciar sesión** se sincroniza desde el perfil del usuario en la base de datos.

---

## Reglas de estilo de traducción

| Regla | Descripción |
|-------|-------------|
| **Tono formal** | Usar "usted" en castellano (actualmente se usa "tú" — revisar según marca) |
| **Consistencia** | Las mismas palabras clave siempre traducidas igual (p. ej., "pedido" = "comanda" en catalán, "order" en inglés) |
| **Longitud** | Las traducciones en catalán e inglés no deben ser mucho más largas que en castellano para no romper el diseño |
| **Placeholders** | Si el texto incluye variables, usa interpolación manual: `t("clave") + " " + valor` |

---

## Glosario de términos clave

| Castellano       | Català          | English          |
|------------------|-----------------|------------------|
| Pedido           | Comanda         | Order            |
| Carne            | Carn            | Meat             |
| Dirección        | Adreça          | Address          |
| Contraseña       | Contrasenya     | Password         |
| Cuenta           | Compte          | Account          |
| Entrega          | Entrega         | Delivery         |
| Iniciar sesión   | Iniciar sessió  | Log in           |
| Cerrar sesión    | Tancar sessió   | Log out          |
| Siguiente        | Següent         | Next             |
| Guardar          | Guardar         | Save             |
| Cancelar         | Cancel·lar      | Cancel           |
| Perfil           | Perfil          | Profile          |
| Ofertas          | Ofertes         | Deals            |
| Categorías       | Categories      | Categories       |
| Notificaciones   | Notificacions   | Notifications    |

---

## Añadir un idioma nuevo (futuro)

1. Añade el código en `i18n.ts`:

```typescript
export type Lang = "es" | "ca" | "en" | "ar"; // árabe como ejemplo
```

2. Crea el objeto de traducción `ar` con todas las claves.

3. Añáde entrada en `LANGUAGES`:

```typescript
export const LANGUAGES = [
  { value: "es", label: "Castellano" },
  { value: "ca", label: "Català" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },  // nuevo
];
```

4. Actualiza el backend: `auth.schema.ts` → `z.enum(["es", "ca", "en", "ar"])`.

5. Considera si el idioma necesita soporte RTL (derecha a izquierda) — React Native tiene soporte nativo con `I18nManager.forceRTL`.

---

## Archivo de referencia rápida

```
frontend/
├── lib/
│   └── i18n.ts              ← TODAS las traducciones + función t()
├── contexts/
│   └── LanguageContext.tsx  ← Hook useLang() + persistencia AsyncStorage
└── app/
    └── language-select.tsx  ← Pantalla de selección de idioma (onboarding)
```
