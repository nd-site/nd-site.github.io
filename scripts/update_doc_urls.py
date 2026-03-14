import os
import re
import urllib.parse

directory = r"d:\NHẬT ĐĂNG --------\WEBSITE\nd-site.github.io\media\docs"
new_base_url_part = "media/docs/file/"

for filename in os.listdir(directory):
    if filename.endswith(".html") and filename != "index.html":
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Look for the iframe src with officeapps.live.com
        # It's usually something like ...?src=ENCODED_URL
        match = re.search(r'src="https://view.officeapps.live.com/op/view.aspx\?src=([^"]+)"', content)
        if match:
            encoded_url = match.group(1)
            decoded_url = urllib.parse.unquote(encoded_url)
            
            # The decoded URL looks like: https://raw.githubusercontent.com/.../main/docx/file/filename.docx
            # We want to change the path part to media/docs/file/
            # Old paths could be docx/file/ or pptx/file/ or media/docx/file/ etc.
            
            # Let's just find the filename at the end
            doc_filename = os.path.basename(decoded_url)
            
            new_decoded_url = f"https://raw.githubusercontent.com/nd-site/nd-site.github.io/refs/heads/main/media/docs/file/{doc_filename}"
            new_encoded_url = urllib.parse.quote(new_decoded_url, safe='')
            
            new_content = content.replace(encoded_url, new_encoded_url)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename}")
