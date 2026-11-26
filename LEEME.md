# GÖZ Parrilla — integración conservadora

Usa este paquete en vez del ZIP anterior. Ambos proyectos conservan sus app.json originales byte por byte. El sitio tiene dos rutas: `/` (MindAR original, productos) y `/fire/` (máscara original, MediaPipe). No es una SPA: la navegación entre rutas evita compartir dos versiones de Three.js y libera la cámara. Un único sitio/hosting. Al regresar, pulsa Iniciar para reactivar la cámara de productos.

## Ensamblaje
1. Haz una copia de seguridad de las dos carpetas originales.
2. Descomprime este ZIP en una carpeta nueva. Copia la carpeta `assets/` COMPLETA del proyecto GÖZ a la raíz. No reemplaces sus archivos GLB, logo, marker/targets.mind, Slash.mp3 ni Fuego.mp3.
3. Copia la carpeta `assets/` COMPLETA de la máscara dentro de `fire/`. Debe contener `fire/assets/mediapipe/face_landmarker.task`. Conserva también cualquier otro recurso del proyecto facial original. Si tienes módulos adicionales originales no adjuntados, conserva sus rutas dentro del proyecto correspondiente.
4. Ejecuta `index.html` con Live Server (localhost) o despliega la carpeta completa en Vercel (HTTPS). No abrir por file://. Necesita conexión a las CDN ya usadas por tus proyectos.
5. Inicia productos, prueba marcador, variantes y ficha. Pulsa GÖZ FIRE, activa cámara frontal, prueba máscara (mesh_0 y gorra), frunce el ceño y guiña cada ojo. Regresa y vuelve a iniciar productos.

## Cambios
- Root index: menú original, opción GÖZ FIRE y limpieza de cámara al salir. Root goz-products.js: retira la ficha bebida; no cambia rutas ni carga de modelos. Root app.js, app.json, mindar_controller.js y Three.js sin cambios.
- fire/: conserva app.json, app.js, face_events.js, mp_face_tracker.js, face_mask.js, face_uv.js, canonical_face_model.js y renderizadores faciales originales. Ajusta el controlador para usar un efecto adicional sin iniciar otro rastreador; adapta webcamera.js para usar el video existente (el archivo compartido exportaba WebCamera con nombre, pero el controlador lo importaba por defecto y le pasaba un video). Añade fire_gestures.js y fire_effects.js. UI del filtro adaptada a GÖZ; oculto el panel de depuración por defecto.
- El humo se ancla aproximadamente a las orejas usando puntos laterales de la cara. El sonido se sintetiza por Web Audio. La sensibilidad es configurable en fire/js/mediapipe/fire_gestures.js.
- No se incluyen assets no adjuntados. No se verificó el funcionamiento con cámara real, CDN, marcador ni GLB. Se comprobó la sintaxis y que ambos JSON permanecen idénticos a los originales.
- Los enlaces de menú web y WhatsApp de la raíz conservan los valores de ejemplo del original; actualízalos antes de publicar.
