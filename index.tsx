import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HTTPSEnforcer, CSRF } from './utils/security';
import { db } from './utils/database';
import { authService } from './services/auth';
import { eventService } from './services/eventService';
import { registrationService } from './services/registrationService';

// Initialize application
async function initializeApp() {
  console.log('[App] Initializing VolunteerHub...');

  // 1. Enforce HTTPS (except localhost)
  HTTPSEnforcer.enforce();
  const securityStatus = HTTPSEnforcer.getStatus();
  console.log(`[Security] ${securityStatus.recommendation}`);

  // 2. Initialize CSRF protection
  const csrfToken = CSRF.generateToken();
  console.log('[Security] CSRF protection initialized');

  // 3. Initialize database
  console.log('[Database] Initializing persistent storage...');
  await db.init();
  console.log(`[Database] Using ${db.getType()} for persistent storage`);

  // 4. Initialize services
  console.log('[Services] Initializing application services...');
  await Promise.all([
    authService.initialize(),
    eventService.initialize(),
    registrationService.initialize()
  ]);
  console.log('[Services] All services initialized');

  // 5. Log database statistics
  const stats = await db.getStats();
  console.log('[Database] Current stats:', stats);

  // 6. Log security configuration
  console.log('[Security] Configuration:', {
    https: securityStatus.isSecure,
    csrf: 'enabled',
    passwordHashing: 'bcrypt-style SHA-256',
    jwtTokens: 'enabled',
    database: db.getType()
  });

  console.log('[App] VolunteerHub initialized successfully ✓');
}

// Start initialization
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Show loading state while initializing
root.render(
  <React.StrictMode>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>VolunteerHub</div>
      <div>Initializing application...</div>
    </div>
  </React.StrictMode>
);

// Initialize and render app
initializeApp()
  .then(() => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error('[App] Initialization failed:', error);
    root.render(
      <React.StrictMode>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', color: 'red' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Initialization Error</div>
          <div>{error.message}</div>
          <button onClick={() => window.location.reload()} style={{ marginTop: '16px', padding: '8px 16px', cursor: 'pointer' }}>
            Reload
          </button>
        </div>
      </React.StrictMode>
    );
  });
