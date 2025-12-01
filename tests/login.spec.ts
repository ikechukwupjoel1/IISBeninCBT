import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/IISBenin CBT/);
});

test('student login flow', async ({ page }) => {
    // Mock Supabase RPC call for student login
    await page.route('**/rest/v1/rpc/verify_student_login', async route => {
        const json = {
            id: 'test-student-id',
            name: 'Test Student',
            role: 'student',
            reg_number: 'IIS-STUDENT'
        };
        await route.fulfill({ json });
    });

    await page.goto('/');

    // Fill in credentials
    await page.getByLabel('Registration No / Staff Email').fill('IIS-STUDENT');
    await page.getByLabel('Access PIN').fill('12345');

    // Click sign in
    await page.getByRole('button', { name: 'Sign In to Portal' }).click();

    // Expect to be redirected to student dashboard
    await expect(page).toHaveURL(/.*\/student/);
    await expect(page.getByText('Student Portal')).toBeVisible();
});
