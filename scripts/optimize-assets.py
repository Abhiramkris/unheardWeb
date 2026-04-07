import os
import subprocess
import glob

# Configuration
ASSET_DIR = "public/assets"
CWEBP_PATH = "/opt/homebrew/bin/cwebp"
QUALITY = 80  # WebP quality (0-100)

def optimize_assets():
    if not os.path.exists(CWEBP_PATH):
        print(f"Error: cwebp not found at {CWEBP_PATH}")
        return

    # Supported extensions to convert
    EXTENSIONS = ('.png', '.jpg', '.jpeg', '.tiff', '.bmp')

    print(f"Starting asset optimization in {ASSET_DIR}...")
    
    # Walk through the directory and its subdirectories
    for root, dirs, files in os.walk(ASSET_DIR):
        for file in files:
            path = os.path.join(root, file)
            ext = os.path.splitext(file)[1].lower()

            # Skip SVG and WebP
            if ext == '.svg' or ext == '.webp':
                # print(f"Skipping {path} (already SVG/WebP)")
                continue

            if ext in EXTENSIONS:
                output_path = os.path.splitext(path)[0] + ".webp"
                
                print(f"Optimizing: {path} -> {output_path}")
                
                # Execute cwebp command
                try:
                    # -q: quality, -quiet: suppress output unless error
                    result = subprocess.run(
                        [CWEBP_PATH, "-q", str(QUALITY), path, "-o", output_path],
                        capture_output=True,
                        text=True
                    )
                    
                    if result.returncode == 0:
                        original_size = os.path.getsize(path)
                        new_size = os.path.getsize(output_path)
                        reduction = (original_size - new_size) / original_size * 100
                        print(f"  Success! Size reduced from {original_size/1024:.1f}KB to {new_size/1024:.1f}KB ({reduction:.1f}% reduction)")
                        
                        # Note: We are keeping the original for safety unless the user specifically wants to delete it.
                        # To delete original, uncomment:
                        # os.remove(path)
                    else:
                        print(f"  Failed: {result.stderr.strip()}")
                except Exception as e:
                    print(f"  Error processing {path}: {str(e)}")

if __name__ == "__main__":
    optimize_assets()
    print("\nOptimization complete. You can now update your components to use the .webp versions.")
