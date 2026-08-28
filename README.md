# ❤️ Botiquín del Corazón (App Móvil & Widget para Android)

> Un botiquín emocional interactivo y personalizado para Android con widget en pantalla de inicio, motor de audio dual con *ducking*, vibración de latido cardíaco (*lub-dub*) y funcionamiento 100% offline.

---

## 🌟 Características Principales

1. **Widget Interactivo en la Pantalla de Inicio:**
   - Muestra un corazón animado y una frase positiva diaria que rota automáticamente cada mañana.
   - Al tocar el widget, abre directamente el botiquín emocional mediante *Deep Linking* (`botiquin://open?mood=...`).

2. **Botiquín Emocional con 4 Estados de Ánimo:**
   - 🛡️ **Tengo Ansiedad:** Frases de calma, respiración guiada y audio relajante.
   - 💖 **Te Extraño:** Mensajes de cercanía y recuerdos especiales.
   - 🌧️ **Tuve un Mal Día:** Palabras de aliento y desahogo para soltar las tensiones.
   - ✨ **Quiero Reírme:** Anécdotas y momentos divertidos grabados en audio.

3. **Motor de Audio con Ducking:**
   - Reproduce la nota de voz grabada en primer plano mientras de fondo suena una pista suave (*lo-fi*, lluvia o piano) con volumen atenuado automáticamente.

4. **Motor Háptico "Lub-Dub":**
   - El motor de vibración del teléfono emite un pulso táctil rítmico que simula el latido de un corazón al tocar los botones.

5. **100% Autónomo y Offline:**
   - Todos los audios, textos y fotos viajan dentro del APK compilado. No requiere internet ni servidores externos.

---

## 🚀 Compilación Automática del APK en GitHub (CI/CD)

El proyecto cuenta con una integración continua (**GitHub Actions**) configurada en `.github/workflows/build-apk.yml`. 

Cada vez que haces un `git push` a tu repositorio, GitHub:
1. Instala el entorno de desarrollo Android y Node.js.
2. Compila el paquete `.apk` de manera automatizada.
3. Genera una **Release** en tu repositorio con el archivo `.apk` listo para descargar e instalar en el teléfono.

### 📲 Cómo descargar e instalar el APK:
1. Ve a la pestaña **Releases** en tu repositorio de GitHub: `https://github.com/UISTALIN2773/Botiqu-n-Del-Coraz-n-/releases`.
2. Descarga el archivo `.apk` generado en la última versión.
3. Transfiérelo o descárgalo directamente en el celular Android e instálalo (permitiendo la opción *"Instalar desde orígenes desconocidos"*).
4. Mantén presionada la pantalla de inicio del teléfono, entra en **Widgets** y coloca el widget **Botiquín del Corazón**.

---

## 🎨 Cómo Personalizar los Audios, Fotos y Frases

### 1. Cambiar las Notas de Voz y Música de Fondo
Coloca tus propios audios en la carpeta `android/app/src/main/res/raw/` con nombres en minúsculas y guiones bajos (ejemplo: `voice_ansiedad_01.mp3`, `voice_te_extrano_01.mp3`, `lofi_loop.mp3`).

### 2. Cambiar las Frases Diarias del Widget
Edita el archivo `src/config/phrases.ts` y añade todas las frases y dedicatorias que quieras que aparezcan en el widget cada día.

### 3. Modificar Textos de los Estados de Ánimo
Edita el archivo `src/config/database.ts` para personalizar los títulos, subtítulos y notas que se muestran al presionar cada estado.

---

## 💻 Comandos para Subir Cambios a GitHub

```bash
# 1. Comprobar archivos modificados
git status

# 2. Agregar todos los cambios
git add .

# 3. Crear el commit
git commit -m "feat: botiquín del corazón con widget android y compilación de apk automática"

# 4. Enviar a GitHub (la compilación del APK arrancará automáticamente)
git push -u origin main
```

---

Desarrollado con ❤️ para crear momentos inolvidables.
