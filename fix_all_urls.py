import os
import re
import glob

def fix_all_url_issues(file_path):
    """Fix all broken URLs in JavaScript files."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        original_content = content
        
        # Fix Contact.js specific URLs
        if 'Contact.js' in file_path:
            content = content.replace("link: 'https://", "link: 'https://wa.me/918220391947'")
            content = re.sub(r"link: 'https://wa\.me/918220391947'\s*},\s*{\s*platform: 'Instagram',\s*icon: '📷',\s*text: '@sri_murugan_bus_krr',\s*link: 'https://", 
                           "link: 'https://wa.me/918220391947'\n        },\n        {\n            platform: 'Instagram',\n            icon: '📷',\n            text: '@sri_murugan_bus_krr',\n            link: 'https://instagram.com/sri_murugan_bus_krr'", content)
            content = re.sub(r"link: 'https://instagram\.com/sri_murugan_bus_krr'\s*},\s*{\s*platform: 'Facebook',\s*icon: '👥',\s*text: 'Sri Murugan Holidays',\s*link: 'https://",
                           "link: 'https://instagram.com/sri_murugan_bus_krr'\n        },\n        {\n            platform: 'Facebook',\n            icon: '👥',\n            text: 'Sri Murugan Holidays',\n            link: 'https://facebook.com/srimuruganholidays'", content)
        
        # Fix Login.js URL
        if 'Login.js' in file_path:
            content = re.sub(r"fetch\('http://localhost:5000[^']*", "fetch('http://localhost:5000/api/login', {", content)
        
        # Fix Signup.js URL
        if 'Signup.js' in file_path:
            content = re.sub(r"fetch\('http://localhost:5000[^']*", "fetch('http://localhost:5000/api/signup', {", content)
        
        # Fix Payment.js URLs
        if 'Payment.js' in file_path:
            content = re.sub(r"fetch\(`http://localhost:5000[^`]*", "fetch(`http://localhost:5000/api/payments/create`, {", content)
            content = re.sub(r"fetch\('http://localhost:5000[^']*", "fetch('http://localhost:5000/api/payments/create', {", content)
        
        # Fix OwnerDashboard.js URLs
        if 'OwnerDashboard.js' in file_path:
            content = re.sub(r"fetch\('http://localhost:5000/api/trips/pending[^']*", "fetch('http://localhost:5000/api/trips/pending')", content)
            content = re.sub(r"fetch\(`http://localhost:5000[^`]*\$\{[^}]*\}[^`]*", lambda m: m.group(0) if '/approve`' in m.group(0) else "fetch(`http://localhost:5000/api/trips/${tripId}/approve`, {", content)
        
        # Fix CustomerDashboard.js URLs
        if 'CustomerDashboard.js' in file_path:
            content = re.sub(r"fetch\(`http://localhost:5000[^`]*\$\{[^}]*\}[^`]*", "fetch(`http://localhost:5000/api/trips/customer/${userId}`)", content)
        
        # Fix UserProfile.js URLs
        if 'UserProfile.js' in file_path:
            content = re.sub(r"fetch\(`http://localhost:5000[^`]*\$\{[^}]*\}/profile[^`]*", "fetch(`http://localhost:5000/api/users/${userId}/profile`)", content)
            content = re.sub(r"fetch\(`http://localhost:5000[^`]*\$\{[^}]*\}[^`]*", lambda m: '/profile`' in m.group(0) if '/profile`' in m.group(0) else "fetch(`http://localhost:5000/api/trips/customer/${userId}`)", content)
        
        # General fixes for any remaining broken URLs
        content = re.sub(r"'http://localhost:5000(?!')", "'http://localhost:5000/api'", content)
        content = re.sub(r'"http://localhost:5000(?!")', '"http://localhost:5000/api"', content)
        content = re.sub(r'`http://localhost:5000(?!`)', '`http://localhost:5000/api', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f"✓ Fixed URLs in: {os.path.basename(file_path)}")
            return True
        else:
            return False
            
    except Exception as e:
        print(f"✗ Error processing {file_path}: {e}")
        return False

def process_directory(directory):
    """Process all JavaScript files in directory and subdirectories."""
    js_files = []
    
    # Find all .js and .jsx files
    for pattern in ['**/*.js', '**/*.jsx']:
        js_files.extend(glob.glob(os.path.join(directory, pattern), recursive=True))
    
    # Filter out node_modules
    js_files = [f for f in js_files if 'node_modules' not in f]
    
    print(f"\nChecking {len(js_files)} JavaScript files for URL issues\n")
    
    fixed_count = 0
    for file_path in js_files:
        if fix_all_url_issues(file_path):
            fixed_count += 1
    
    if fixed_count > 0:
        print(f"\n✓ Fixed URLs in {fixed_count} files")
    else:
        print("\n✓ No URL issues found")

if __name__ == "__main__":
    print("=" * 50)
    print("Fixing ALL Broken URLs in JavaScript Files")
    print("=" * 50)
    
    # Process src directory
    process_directory(r"F:\uidexp\src")
    
    print("\n✓ URL fixing complete!")
