# 🐾 PetMemories Family

Registro colaborativo de recuerdos de mascotas para toda la familia.

## ✨ Características

- 📋 Ficha completa de cada mascota (nombre, raza, año de nacimiento, descripción)
- 🌳 Árbol genealógico interactivo con vínculos entre mascotas
- 📖 Anécdotas y comentarios por mascota
- 🎨 Generación de avatar cartoon/anime con IA (Claude)
- 🖼️ Galería y timeline familiar
- 💾 Datos guardados en el navegador (localStorage)
- 🚀 Deploy automático en GitHub Pages

## 🚀 Cómo usar

### Desarrollo local

```bash
npm install
npm run dev
```

### Deploy en GitHub Pages

1. Crear repositorio en GitHub con el nombre `petmemories-family`
2. Subir este código al branch `main`
3. Ir a **Settings → Pages → Source: GitHub Actions**
4. El workflow se ejecuta automáticamente en cada push
5. La app estará en: `https://TU-USUARIO.github.io/petmemories-family/`

### Configurar nombre del repo

Si usás un nombre distinto al repositorio, editar `vite.config.js`:

```js
base: '/NOMBRE-DE-TU-REPO/',
```

## 📁 Estructura

```
src/
├── components/     # Navbar, PetCard
├── pages/          # Home, PetProfile, AddPet, FamilyTree, Gallery
├── hooks/          # usePets (estado central)
├── data/           # pets.json (datos de ejemplo)
└── styles/         # CSS global
```

## 👨‍👩‍👧 Colaboración familiar

- Cualquier miembro de la familia puede ver la app (es pública)
- Para editar, hacer fork o pedir acceso al repositorio
- Cada cambio queda registrado en el historial de git

## 🤖 Avatar IA

La función de avatar usa Claude para analizar la foto de la mascota y generar
una descripción detallada que puede usarse en herramientas de generación de imágenes
como Midjourney, DALL-E o Stable Diffusion con el prompt:
> "anime cartoon pet portrait, [descripción generada], soft colors, cute style"
