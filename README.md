# EPIT Labs - UNSA Wiki 🎓📶

**EPIT Labs UNSA Wiki** es un portal informativo y técnico de última generación diseñado para la comunidad académica de la **Escuela Profesional de Ingeniería de Telecomunicaciones (EPIT)** de la **Universidad Nacional de San Agustín de Arequipa (UNSA)**. 

Este sistema centraliza el inventario, especificaciones técnicas y gestión de los ambientes de aprendizaje (laboratorios y talleres), equipamiento especializado, licencias de software y documentación regulatoria (SST).

---

## 📌 Características Principales

### 🔬 1. Catálogo Dinámico de Ambientes
- **Visualización Estructurada:** Lista completa de laboratorios y talleres clasificados según su código oficial, programa académico y tipo.
- **Acceso Modular:** Navegación fluida entre tres secciones clave por cada ambiente:
  - **Información General:** Metas, ubicación exacta, aforo, horarios y personal encargado.
  - **Equipos Técnicos:** Inventario detallado de instrumentos con fichas técnicas e imágenes ilustrativas.
  - **Software y Licencias:** Lista de programas instalados, versiones y tipos de licencias (académicas, comerciales, open-source).

### 🛠️ 2. Fichas Técnicas de Equipamiento
- Buscador y visualizador interactivo de equipos.
- Modales detallados con parámetros específicos (marca, modelo, número de serie, estado operativo, manual de usuario y directrices de uso).

### 👥 3. Gestión y Autoridades
- Muestra de información actualizada sobre la **Dirección del Programa de Estudios** y el **Departamento Académico de Adscripción**.
- Incluye períodos de gestión, datos de contacto oficiales, correos institucionales y fotografía de las autoridades.

### 📄 4. Documentación Técnica y SST
- Acceso directo a planes de evacuación, reglamentos de seguridad y salud en el trabajo (SST) específicos de telecomunicaciones.
- Integración con recursos oficiales de la UNSA.

### 🛡️ 5. Modo Administrador / Edición Activo
- Control interactivo de visibilidad en vivo de laboratorios y componentes.
- Permite a los docentes y administradores simular u ocultar entornos no disponibles o en mantenimiento de cara al público general.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 18+ con Vite para un desarrollo ágil y compilación de alto rendimiento.
- **Lenguaje:** TypeScript, garantizando tipado estático fuerte y un código robusto.
- **Estilos:** Tailwind CSS, aplicando un diseño moderno, limpio y adaptable a dispositivos móviles (Mobile-First).
- **Animaciones:** Framer Motion (`motion/react`) para transiciones interactivas sumamente fluidas.
- **Iconografía:** Lucide React, proporcionando un set consistente de iconos vectoriales.

---

## 📂 Estructura del Proyecto

```text
├── .github/workflows/   # Flujos de trabajo automatizados (ej. Deploy en GitHub Pages)
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx               # Barra de navegación lateral con filtro de mapas del sitio
│   │   ├── HomeView.tsx              # Vista principal (Métricas, Autoridades, SST, Galería de laboratorios)
│   │   ├── LabDetailView.tsx         # Gestión detallada por laboratorio (Info, Equipos, Software)
│   │   └── EquipmentDetailModal.tsx  # Ficha técnica interactiva de equipamiento
│   ├── App.tsx                       # Componente principal y enrutador de vistas
│   ├── main.tsx                      # Punto de entrada de la aplicación
│   ├── index.css                     # Configuración global y directivas de Tailwind CSS
│   └── types.ts                      # Interfaces y tipos globales de TypeScript
├── package.json                      # Configuración de dependencias y scripts de ejecución
└── README.md                         # Documentación del proyecto (Este archivo)
```

---

## 💻 Instalación y Ejecución Local

Para ejecutar este portal en tu entorno local, sigue estos pasos:

### 1. Clonar el repositorio e ingresar
```bash
git clone <url-del-repositorio>
cd epit-labs-unsa-wiki
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar servidor de desarrollo
```bash
npm run dev
```
El servidor se iniciará localmente. Abre tu navegador en la dirección indicada en la terminal (usualmente `http://localhost:3000` o `http://localhost:5173`).

### 4. Compilar para producción
Para generar los archivos estáticos listos para desplegar en producción:
```bash
npm run build
```
Esto creará una carpeta `dist/` con todo el código optimizado, minificado y listo para hosting.

