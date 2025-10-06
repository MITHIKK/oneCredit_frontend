import os
import re
import glob

def remove_comments_from_js(file_path):
    """Remove single-line and multi-line comments from JavaScript file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Remove single-line comments (// ...)
        content = re.sub(r'//.*?$', '', content, flags=re.MULTILINE)
        
        # Remove multi-line comments (/* ... */)
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        
        # Remove JSX comments ({/* ... */})
        content = re.sub(r'\{/\*.*?\*/\}', '', content, flags=re.DOTALL)
        
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        
        print(f"✓ Removed comments from: {os.path.basename(file_path)}")
        return True
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
    
    print(f"\nFound {len(js_files)} JavaScript files to process\n")
    
    success_count = 0
    for file_path in js_files:
        if remove_comments_from_js(file_path):
            success_count += 1
    
    print(f"\n✓ Successfully processed {success_count}/{len(js_files)} files")

if __name__ == "__main__":
    # Process frontend files
    print("=" * 50)
    print("Processing Frontend JavaScript Files")
    print("=" * 50)
    process_directory(r"F:\uidexp\src")
    
    # Process backend files
    print("\n" + "=" * 50)
    print("Processing Backend JavaScript Files")
    print("=" * 50)
    process_directory(r"F:\uidexp\backend")
    
    # Process root level files
    print("\n" + "=" * 50)
    print("Processing Root Level JavaScript Files")
    print("=" * 50)
    root_files = glob.glob(r"F:\uidexp\*.js")
    root_files = [f for f in root_files if 'node_modules' not in f]
    
    for file_path in root_files:
        remove_comments_from_js(file_path)
    
    print("\n✓ Comment removal complete!")
