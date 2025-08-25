// Utilidad para suprimir errores de ResizeObserver de manera más agresiva
export const suppressResizeObserverErrors = () => {
  // Patrón para detectar errores de ResizeObserver
  const resizeObserverErr = /ResizeObserver loop (completed with undelivered notifications|limit exceeded)/;
  
  // 1. Interceptar React Error Reporting
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined') {
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook.onErrorOrWarning) {
      const originalOnErrorOrWarning = hook.onErrorOrWarning;
      hook.onErrorOrWarning = function(...args) {
        const message = args[0];
        if (typeof message === 'string' && resizeObserverErr.test(message)) {
          return; // Suprimir
        }
        return originalOnErrorOrWarning.apply(this, args);
      };
    }
  }

  // 2. Interceptar reportError del navegador
  if (typeof window.reportError === 'function') {
    const originalReportError = window.reportError;
    window.reportError = function(error) {
      if (error && error.message && resizeObserverErr.test(error.message)) {
        return; // Suprimir
      }
      return originalReportError.call(this, error);
    };
  }

  // 3. Interceptar console.error con más precisión
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Verificar todos los argumentos
    const hasResizeObserverError = args.some(arg => 
      (typeof arg === 'string' && resizeObserverErr.test(arg)) ||
      (arg && arg.message && resizeObserverErr.test(arg.message)) ||
      (arg && arg.stack && resizeObserverErr.test(arg.stack))
    );
    
    if (hasResizeObserverError) {
      return; // Suprimir
    }
    
    originalConsoleError.apply(console, args);
  };

  // 4. Interceptar handleError específico del bundle
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = function(callback, delay, ...args) {
    if (typeof callback === 'function') {
      const wrappedCallback = function(...callbackArgs) {
        try {
          return callback.apply(this, callbackArgs);
        } catch (error) {
          if (error && error.message && resizeObserverErr.test(error.message)) {
            return; // Suprimir
          }
          throw error;
        }
      };
      return originalSetTimeout.call(this, wrappedCallback, delay, ...args);
    }
    return originalSetTimeout.call(this, callback, delay, ...args);
  };

  // 5. Patch específico para el bundle de React en desarrollo
  if (process.env.NODE_ENV === 'development') {
    // Interceptar cualquier función handleError que pueda existir
    const checkAndPatchHandleError = () => {
      if (typeof window.handleError === 'function') {
        const originalHandleError = window.handleError;
        window.handleError = function(error) {
          if (error && error.message && resizeObserverErr.test(error.message)) {
            return; // Suprimir
          }
          return originalHandleError.call(this, error);
        };
      }
    };
    
    // Ejecutar inmediatamente y después de un delay
    checkAndPatchHandleError();
    setTimeout(checkAndPatchHandleError, 100);
  }
};

// Ejecutar inmediatamente al importar
suppressResizeObserverErrors();
