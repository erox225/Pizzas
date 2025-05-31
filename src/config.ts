/**
 * Proyecto: configuración global de datos
 * ---------------------------------------
 * Esta bandera controla de dónde obtiene datos la app:
 *  - true  -> usar mocks locales (src/data/mocks.ts)
 *  - false -> usar Firestore/servicios reales
 *
 * Cómo se decide el valor:
 *  - Lee la variable Vite `VITE_USE_MOCKS`.
 *  - En desarrollo: por defecto true (a menos que se fuerce a 'false').
 *  - En producción: por defecto false (a menos que se fuerce a 'true').
 *
 * Configuración recomendada de entornos:
 *  - .env.development -> VITE_USE_MOCKS=true
 *  - .env.production  -> VITE_USE_MOCKS=false
 */
export const USE_MOCKS: boolean =
  (typeof import.meta !== 'undefined' && (import.meta as any).env && ((import.meta as any).env.VITE_USE_MOCKS === 'true'))
  || ((typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.MODE) !== 'production' && ((import.meta as any).env.VITE_USE_MOCKS ?? 'true') === 'true');
