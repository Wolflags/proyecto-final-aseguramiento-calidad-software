import { test, expect } from '@playwright/test';

test.use({ storageState: './tests/auth.json' });

test('Eliminar un producto', async ({ page }) => {
  // Ir a la página principal donde ya existen productos
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Verificar que estamos en la página principal
  await expect(page).toHaveURL('/');

  // Esperar a que la tabla de productos esté cargada
  await page.waitForSelector('table tbody tr', { timeout: 10000 });

  // Seleccionar el primer producto de la tabla para eliminar
  const firstProductRow = page.locator('table tbody tr').first();
  await expect(firstProductRow).toBeVisible();

  // Obtener el nombre del producto antes de eliminarlo para verificar después
  const productNameElement = firstProductRow.locator('td').nth(1); // Asumiendo que el nombre está en la segunda columna
  const productName = await productNameElement.textContent();
  
  // Verificar que tenemos un nombre de producto válido
  expect(productName).toBeTruthy();
  
  // Ahora eliminar el producto
  // Hacer clic en el botón de eliminar del producto
  const deleteButton = firstProductRow.locator('button#deleteButton').first();
  await deleteButton.click();

  // Esperar a que aparezca el dialog de confirmación
  await page.waitForSelector('[data-testid="delete-confirmation-dialog"]', { state: 'visible' });

  // Confirmar la eliminación haciendo clic en el botón de confirmar
  const confirmDeleteButton = page.locator('button#confirmDeleteButton');
  
  // Esperar tanto el clic como la respuesta de la API
  await Promise.all([
    page.waitForResponse(response => 
      response.url().includes('/api/productos') && 
      response.status() === 200
    ),
    confirmDeleteButton.click()
  ]);

  // Esperar a que el dialog se cierre
  await page.waitForSelector('[data-testid="delete-confirmation-dialog"]', { state: 'hidden', timeout: 10000 });

  // Verificar que el producto ya no esté en la tabla usando el nombre que obtuvimos
  if (productName) {
    const deletedProductRow = page.locator(`tr:has-text("${productName.trim()}")`);
    await expect(deletedProductRow).not.toBeVisible({ timeout: 10000 });
  }
  
});
  