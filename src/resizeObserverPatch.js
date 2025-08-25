// Solución limpia para prevenir loops de ResizeObserver
// Este archivo debe importarse antes que cualquier otro en index.js

if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Aplicando solución preventiva para ResizeObserver...');
  
  // Throttle más robusto para evitar llamadas excesivas
  const throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // Solamente parchear ResizeObserver para usar throttling robusto
  if (typeof window !== 'undefined' && window.ResizeObserver) {
    const OriginalResizeObserver = window.ResizeObserver;
    
    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback) {
        // Usar throttling más agresivo para evitar loops
        const throttledCallback = throttle((entries, observer) => {
          // Verificar que las entradas realmente hayan cambiado
          const hasValidChanges = entries.some(entry => {
            const { contentRect } = entry;
            return contentRect.width > 0 && contentRect.height > 0;
          });
          
          if (hasValidChanges) {
            try {
              callback(entries, observer);
            } catch (error) {
              // Solo silenciar errores específicos de ResizeObserver
              if (error.message && error.message.includes('ResizeObserver loop')) {
                console.debug('🔇 ResizeObserver loop prevented');
                return;
              }
              throw error;
            }
          }
        }, 200); // Throttling más conservador: máximo 5 veces por segundo
        
        super(throttledCallback);
      }
    };
    console.log('✅ ResizeObserver optimizado con throttling robusto');
  }

  console.log('✅ Solución preventiva aplicada');
}
