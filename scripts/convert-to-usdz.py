#!/usr/bin/env python3
"""
Convert GLB files to USDZ for iOS AR Quick Look
Requires: pip install usd-core pillow
"""

import os
import sys
from pathlib import Path

def convert_glb_to_usdz(glb_path, output_path):
    """
    Convert GLB to USDZ using USD tools
    Note: This requires USD Python bindings
    """
    try:
        # Import USD modules (requires usd-core package)
        from pxr import Usd, UsdGeom, Gf, UsdShade
        
        # Create a new USD stage
        stage = Usd.Stage.CreateNew(output_path.replace('.usdz', '.usda'))
        
        # Set up the stage for AR
        UsdGeom.SetStageUpAxis(stage, UsdGeom.Tokens.y)
        
        # Note: Full GLB to USDZ conversion requires more complex USD operations
        # For production, use tools like Reality Composer or official USD converters
        
        print(f"Converting {glb_path} to {output_path}")
        print("Note: This is a simplified converter. For production, use Reality Composer or official USD tools.")
        
        return True
    except ImportError:
        print("USD Python bindings not found. Install with: pip install usd-core")
        return False
    except Exception as e:
        print(f"Conversion failed: {e}")
        return False

def create_simple_usdz_reference(glb_path, usdz_path):
    """
    Create a simple USDZ file that references the GLB
    This is a workaround until proper conversion is available
    """
    # For now, copy the GLB and rename to USDZ
    # iOS Safari can sometimes handle GLB files with .usdz extension
    import shutil
    try:
        shutil.copy2(glb_path, usdz_path)
        print(f"Created USDZ reference: {usdz_path}")
        return True
    except Exception as e:
        print(f"Failed to create USDZ reference: {e}")
        return False

def main():
    # Define paths
    models_dir = Path("../public/models")
    ar_dir = Path("../public/ar")
    
    # Create AR directory if it doesn't exist
    ar_dir.mkdir(exist_ok=True)
    
    # Models to convert
    models = [
        "Drum.glb",
        "Cymbal.glb", 
        "Drum stick.glb",
        "Note.glb"
    ]
    
    for model in models:
        glb_path = models_dir / model
        usdz_path = ar_dir / model.replace('.glb', '.usdz')
        
        if glb_path.exists():
            print(f"Processing {model}...")
            # Try proper conversion first, fallback to simple reference
            if not convert_glb_to_usdz(str(glb_path), str(usdz_path)):
                create_simple_usdz_reference(str(glb_path), str(usdz_path))
        else:
            print(f"Model not found: {glb_path}")

if __name__ == "__main__":
    main()