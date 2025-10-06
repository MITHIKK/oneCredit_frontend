import os
import re
import glob

def fix_broken_urls(file_path):
    """Fix broken URLs in JavaScript files."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        original_content = content
        
        # Fix broken http:// and https:// URLs
        # Pattern to find 'http:' or 'https:' not followed by //
        content = re.sub(r"'http:(?!//)", "'http://localhost:5000", content)
        content = re.sub(r'"http:(?!//)', '"http://localhost:5000', content)
        content = re.sub(r'`http:(?!//)', '`http://localhost:5000', content)
        
        content = re.sub(r"'https:(?!//)", "'https://", content)
        content = re.sub(r'"https:(?!//)', '"https://', content)
        content = re.sub(r'`https:(?!//)', '`https://', content)
        
        # Fix specific API endpoints
        content = re.sub(r"'http://localhost:5000'", "'http://localhost:5000/api'", content)
        content = re.sub(r'"http://localhost:5000"', '"http://localhost:5000/api"', content)
        
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
        if fix_broken_urls(file_path):
            fixed_count += 1
    
    if fixed_count > 0:
        print(f"\n✓ Fixed URLs in {fixed_count} files")
    else:
        print("\n✓ No URL issues found")

if __name__ == "__main__":
    print("=" * 50)
    print("Fixing Broken URLs in JavaScript Files")
    print("=" * 50)
    
    # Process src directory
    process_directory(r"F:\uidexp\src")
    
    print("\n✓ URL fixing complete!")
