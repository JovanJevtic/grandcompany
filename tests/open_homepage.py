from playwright.sync_api import sync_playwright
import os

html_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
file_url = f'file://{html_path}'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto(file_url)
    page.wait_for_load_state('networkidle')
    screenshot_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'screenshot_homepage.png'))
    page.screenshot(path=screenshot_path, full_page=True)
    print(f"Uspjesno pokrenut ecommerce sajt! Screenshot: {screenshot_path}")
    print(f"URL: file://{html_path}")
    browser.close()
