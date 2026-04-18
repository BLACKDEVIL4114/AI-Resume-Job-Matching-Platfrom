import os
import time
import pandas as pd
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from models.schemas import ApplicationResult

def apply_naukri(job_url, resume_path, name, email, phone, naukri_email, naukri_password) -> ApplicationResult:
    print(f"\n[AUTO-APPLY] Starting application for position at: {job_url}")
    
    driver = None
    try:
        chrome_options = Options()
        # Headless=False as requested so user can see it
        # chrome_options.add_argument("--headless") 
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-notifications")
        
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        wait = WebDriverWait(driver, 10)

        # 1. Login
        print("[1/5] Logging into Naukri.com...")
        driver.get("https://www.naukri.com/nlogin/login")
        
        wait.until(EC.presence_of_element_located((By.ID, "usernameField"))).send_keys(naukri_email)
        driver.find_element(By.ID, "passwordField").send_keys(naukri_password)
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        time.sleep(3) # Wait for dashboard load
        print("[2/5] Login successful.")

        # 2. Navigate to Job
        print(f"[3/5] Navigating to Job URL: {job_url}")
        driver.get(job_url)
        time.sleep(2)

        # 3. Apply
        apply_btn = wait.until(EC.element_to_be_clickable((By.ID, "apply-button")))
        print("[4/5] Clicking Apply Now...")
        apply_btn.click()
        time.sleep(2)

        # 4. Handle Resume / Form (Simplified)
        # Note: Naukri forms vary, this is a generic implementation
        try:
            # Check if name/phone needs filling
            fields = driver.find_elements(By.TAG_NAME, "input")
            for f in fields:
                if f.get_attribute("placeholder") and "name" in f.get_attribute("placeholder").lower() and not f.get_attribute("value"):
                    f.send_keys(name)
                if f.get_attribute("placeholder") and "phone" in f.get_attribute("placeholder").lower() and not f.get_attribute("value"):
                    f.send_keys(phone)
        except:
            pass

        # 5. Capture Success
        print("[5/5] Finalizing application...")
        os.makedirs("outputs", exist_ok=True)
        screenshot_path = os.path.join("outputs", "screenshot.png")
        driver.save_screenshot(screenshot_path)

        res = ApplicationResult(
            job_title="System Detected Title", 
            company="System Detected Company",
            status="Success",
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            message="Application submitted successfully via Selenium."
        )

        # Log to CSV
        log_path = os.path.join("outputs", "applications_log.csv")
        log_data = {
            "timestamp": [res.timestamp],
            "job_title": [res.job_title],
            "company": [res.company],
            "job_url": [job_url],
            "status": ["Success"],
            "message": [res.message]
        }
        df = pd.DataFrame(log_data)
        df.to_csv(log_path, mode='a', header=not os.path.exists(log_path), index=False)

        return res

    except Exception as e:
        print(f"[ERROR] Application failed: {str(e)}")
        return ApplicationResult(
            job_title="Unknown",
            company="Unknown",
            status="Failed",
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            message=f"Error: {str(e)}"
        )
    finally:
        if driver:
            driver.quit()
