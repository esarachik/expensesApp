# Estructura del Proyecto

Este proyecto está organizado bajo la carpeta `src/` siguiendo las mejores prácticas para aplicaciones Expo robustas y extensibles.

## 📁 Estructura de Carpetas

```
src/
├── app/                    # Rutas y páginas de Expo Router
│   ├── (tabs)/            # Layout de pestañas
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── expenses.tsx
│   ├── _layout.tsx        # RootLayout
│   ├── modal.tsx          # Modal de detalles
│   └── +not-found.tsx     # Página 404
│
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de UI básicos
│   │   ├── collapsible.tsx
│   │   ├── icon-symbol.tsx
│   │   └── icon-symbol.ios.tsx
│   ├── voice-recorder.tsx      # Grabador de voz
│   ├── transaction-detail.tsx  # Detalles de transacción
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   ├── haptic-tab.tsx
│   ├── hello-wave.tsx
│   ├── parallax-scroll-view.tsx
│   └── external-link.tsx
│
├── services/             # Lógica de negocio y APIs
│   ├── database.ts       # SQLite - Gestión de BD
│   ├── openai.ts         # Integración con OpenAI (GPT)
│   └── whisper.ts        # Transcripción de audio con Whisper API
│
├── hooks/                # Hooks personalizados
│   ├── use-color-scheme.ts
│   ├── use-color-scheme.web.ts
│   └── use-theme-color.ts
│
├── constants/            # Constantes y configuración
│   ├── config.ts         # Variables de entorno y configuración
│   └── theme.ts          # Temas y estilos globales
│
├── types/                # Definiciones de tipos TypeScript
│   └── transaction.ts    # Tipos de transacciones
│
└── assets/               # Recursos estáticos
    └── images/          # Imágenes e iconos
        ├── icon.png
        ├── splash-icon.png
        ├── react-logo.png
        └── ...
```

## 🗂️ Convenciones

### Imports
Todos los imports usan el alias `@/` configurado en `tsconfig.json`:

```typescript
// ✅ Correcto
import { MyComponent } from '@/components/my-component';
import { useThemeColor } from '@/hooks/use-theme-color';
import { insertTransaction } from '@/services/database';

// ❌ Evitar
import { MyComponent } from '../..components/my-component';
```

### Nombrado de Archivos
- Componentes: `kebab-case.tsx` (ej: `voice-recorder.tsx`)
- Servicios: `kebab-case.ts` (ej: `openai.ts`)
- Hooks: `use-[nombre].ts` (ej: `use-color-scheme.ts`)
- Tipos: `descriptivo.ts` (ej: `transaction.ts`)

### Servicios
Los servicios encapsulan la lógica de negocios:
- `database.ts`: CRUD de transacciones en SQLite
- `openai.ts`: Parsing de texto con GPT
- `whisper.ts`: Transcripción de audio a texto

## 🚀 Uso

### Ejecutar en Web
```bash
npm run web
```

### Ejecutar en iOS
```bash
npm run ios
```

### Ejecutar en Android
```bash
npm run android
```

## 📦 Dependencias Clave
- **expo-router**: Ruteo y navegación
- **expo-audio**: Grabación de audio
- **expo-sqlite**: Base de datos local
- **@react-navigation**: Navegación avanzada
- **typescript**: Tipado estático

## 🎯 Próximos Pasos
- Agregar más páginas bajo `app/(tabs)/`
- Crear nuevos componentes reutilizables
- Expandir servicios según sea necesario
