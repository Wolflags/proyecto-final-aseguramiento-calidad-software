import { test, expect } from '@playwright/test';

test.use({ storageState: './tests/auth.json' });

test('Editar un producto existente', async ({ page }) => {
  // Ir a la página principal
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Verificar que estamos en la página principal
  await expect(page).toHaveURL('/');

  // Esperar a que la tabla de productos esté cargada
  await page.waitForSelector('table tbody tr', { timeout: 10000 });

  // Seleccionar el primer producto de la tabla para editar
  const firstProductRow = page.locator('table tbody tr').first();
  await expect(firstProductRow).toBeVisible();

  // Hacer clic en el botón de editar del primer producto
  const editButton = firstProductRow.locator('button#editButton').first();
  await Promise.all([
    editButton.click()
  ]);

  // Esperar a que el dialog esté visible
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });

  // Obtener los valores actuales del formulario para verificar que se cargaron
  const currentName = await page.inputValue('input[name="name"]');
  const currentDescription = await page.inputValue('textarea[name="description"]');
  const currentPrice = await page.inputValue('input[name="price"]');
  const currentQuantity = await page.inputValue('input[name="quantity"]');

  // Verificar que los campos tienen valores (no están vacíos)
  expect(currentName).toBeTruthy();
  expect(currentDescription).toBeTruthy();
  expect(currentPrice).toBeTruthy();
  expect(currentQuantity).toBeTruthy();

  // Modificar los campos del formulario
  await page.fill('input[name="name"]', 'Producto Editado Test');
  await page.fill('textarea[name="description"]', 'Descripción editada del producto test');
  await page.selectOption('select[name="category"]', 'Gaming');
  await page.fill('input[name="price"]', '150.99');
  await page.fill('input[name="quantity"]', '25');

  // Hacer clic en el botón de guardar y esperar la respuesta
  const saveButton = page.locator('button#submitButton');
  
  // Esperar tanto el clic como la respuesta de la API
  await Promise.all([
    page.waitForResponse(response => 
      response.url().includes('/api/productos') && 
      (response.status() === 200 || response.status() === 201)
    ),
    saveButton.click()
  ]);

  // Esperar a que el dialog se cierre
  await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 });

  // Verificar que el producto se haya editado correctamente en la tabla
  const editedProductRow = page.locator('table tbody tr', { 
    hasText: 'Producto Editado Test' 
  }).first();
  
  // Verificar que la fila del producto editado es visible
  await expect(editedProductRow).toBeVisible({ timeout: 10000 });
  
  // Verificaciones adicionales de los datos editados
  await expect(editedProductRow.locator('td', { hasText: 'Producto Editado Test' })).toBeVisible();
  await expect(editedProductRow.locator('td', { hasText: 'Gaming' })).toBeVisible();
  await expect(editedProductRow.locator('td', { hasText: '$150.99' })).toBeVisible();
  await expect(editedProductRow.locator('td', { hasText: '25' })).toBeVisible();
  
});
