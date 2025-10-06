import os
import re

def remove_comments_from_file(file_path):
    """Remove single-line comments (//) from JavaScript files"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Remove single-line comments that start with //
        # But preserve URLs (http://, https://) and other legitimate uses
        lines = content.split('\n')
        cleaned_lines = []
        
        for line in lines:
            # Check if line contains // but is not a URL
            if '//' in line:
                # Check if it's part of a URL
                if 'http://' in line or 'https://' in line:
                    cleaned_lines.append(line)
                else:
                    # Find the position of // and remove everything after it
                    # But make sure it's not inside a string
                    in_string = False
                    quote_char = None
                    comment_pos = -1
                    
                    for i, char in enumerate(line):
                        if char in ['"', "'"] and (i == 0 or line[i-1] != '\\'):
                            if not in_string:
                                in_string = True
                                quote_char = char
                            elif char == quote_char:
                                in_string = False
                                quote_char = None
                        elif not in_string and i < len(line) - 1 and line[i:i+2] == '//':
                            comment_pos = i
                            break
                    
                    if comment_pos != -1:
                        cleaned_line = line[:comment_pos].rstrip()
                        cleaned_lines.append(cleaned_line)
                    else:
                        cleaned_lines.append(line)
            else:
                cleaned_lines.append(line)
        
        # Join lines back together
        cleaned_content = '\n'.join(cleaned_lines)
        
        # Remove empty lines that were left after removing comments
        cleaned_lines = []
        for line in cleaned_content.split('\n'):
            if line.strip() or (cleaned_lines and cleaned_lines[-1].strip()):
                cleaned_lines.append(line)
        
        cleaned_content = '\n'.join(cleaned_lines)
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(cleaned_content)
        
        print(f"✅ Cleaned comments from: {file_path}")
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {str(e)}")

def remove_comments_from_directory(directory):
    """Remove comments from all JavaScript files in directory"""
    js_extensions = ['.js', '.jsx', '.ts', '.tsx']
    
    for root, dirs, files in os.walk(directory):
        # Skip node_modules and build directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'build', '.git']]
        
        for file in files:
            if any(file.endswith(ext) for ext in js_extensions):
                file_path = os.path.join(root, file)
                remove_comments_from_file(file_path)

if __name__ == "__main__":
    project_dir = "F:/uidexp"
    print("🧹 Removing comments from JavaScript files...")
    remove_comments_from_directory(project_dir)
    print("✅ Comment removal completed!")
