import { test as setup } from '@playwright/test';

const authFile = './tests/auth.json';

setup('authenticate', async ({ page, context }) => {
  // Aumentar timeout para este test
  setup.setTimeout(60000);
  
  // Ir al login con configuración más robusta
  await page.goto('/login', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  // Esperar a que la página se estabilice
  await page.waitForLoadState('domcontentloaded');
  
  // Buscar y hacer clic en el botón de login con Keycloak
  const kcLoginButton = page.locator('button#kc-login').first();
  await kcLoginButton.waitFor({ state: 'visible', timeout: 10000 });
  await kcLoginButton.click();
  
  // Esperar a que aparezca el formulario de Keycloak
  await page.waitForSelector('#username', { state: 'visible', timeout: 15000 });
  
  // Llenar credenciales
  await page.fill('#username', 'admin1');
  await page.fill('#password', 'admin1');
  
  // Buscar el botón de login en Keycloak y hacer clic
  const keycloakSubmitButton = page.locator('button#kc-login, input[type="submit"]').first();
  await keycloakSubmitButton.waitFor({ state: 'visible' });
  
  // Hacer clic y esperar navegación
  await Promise.all([
    page.waitForURL('/', { timeout: 30000 }),
    keycloakSubmitButton.click()
  ]);
  
  const userMenuButton = page.locator('button#userMenuButton');
  // Esperar a que el dashboard esté completamente cargado
  await userMenuButton.waitFor({ state: 'visible', timeout: 30000 });
  
  // Guardamos el estado después de que todo esté cargado
  await context.storageState({ path: authFile });
});
