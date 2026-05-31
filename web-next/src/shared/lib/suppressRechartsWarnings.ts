// Utility to suppress known recharts duplicate key warnings
// These warnings are internal to the recharts library and don't affect functionality

const originalConsoleError = console.error;

// Immediately suppress on import
console.error = (...args: any[]) => {
  // Suppress recharts duplicate key warnings
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Encountered two children with the same key')
  ) {
    // Silently ignore this specific recharts internal warning
    return;
  }
  
  // Pass through all other errors
  originalConsoleError.apply(console, args);
};

export function suppressRechartsWarnings() {
  // Already applied above
}

export function restoreConsoleError() {
  console.error = originalConsoleError;
}