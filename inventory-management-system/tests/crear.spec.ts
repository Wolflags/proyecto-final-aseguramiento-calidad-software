import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth.json' });

test('Crear un nuevo producto', async ({ page }) => {
  // Ir a la página de crear producto
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Verificar que estamos en la página de crear producto
  await expect(page).toHaveURL('/');

  // Hacer click en el boton de agregar producto
  const addButton = page.locator('button#addButton');
  await addButton.click();

  // Esperar a que el dialog esté visible antes de llenar el formulario
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });

  // Llenar el formulario de creación de producto
  await page.fill('input[name="name"]', 'Producto de Prueba');
  await page.fill('textarea[name="description"]', 'Descripción del producto de prueba');
  await page.selectOption('select[name="category"]', 'Electrónicos');
  await page.fill('input[name="price"]', '100.00');
  await page.fill('input[name="quantity"]', '10');

  // Hacer clic en el botón de guardar y esperar la respuesta
  const saveButton = page.locator('button#submitButton');
  
  // Esperar tanto el clic como la respuesta de la API
  await Promise.all([
    saveButton.click()
  ]);

  // Esperar a que el dialog se cierre usando el atributo data-state
  await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 });

  // Verificar que el producto se haya creado correctamente
  // Buscar la fila que contiene el nombre del producto, obtener solo el primer resultado
    const productRow = page.locator('tr:has-text("Producto de Prueba")').first();
  
  // Verificar que la fila del producto es visible
  await expect(productRow).toBeVisible({ timeout: 10000 });
  
  
});
  