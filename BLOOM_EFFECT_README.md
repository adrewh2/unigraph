# ForceGraph3D Bloom Effect Feature

## Overview

This feature adds selective bloom post-processing effects to the ForceGraph3D view when nodes are selected. Instead of just changing the color of selected nodes to orange, selected nodes now have a beautiful glowing bloom effect that makes them stand out dramatically.

## Features

- **Selective Bloom**: Only selected nodes receive the bloom effect
- **Dynamic Updates**: Bloom effect updates in real-time as nodes are selected/deselected
- **Performance Optimized**: Uses Three.js post-processing pipeline efficiently
- **Responsive**: Bloom effect adapts to window resizing

## How It Works

### Technical Implementation

1. **Bloom Layer System**: Selected nodes are assigned to a special Three.js layer (BLOOM_LAYER = 1)
2. **Post-Processing Pipeline**: Uses Three.js EffectComposer with UnrealBloomPass
3. **Material Enhancement**: Selected nodes get emissive materials for enhanced glow
4. **Render Override**: Custom render method combines normal scene with bloom effect

### Key Components

- `ForceGraph3DViewV2WithBloom.tsx`: Main component with bloom effect
- `BLOOM_PARAMS`: Configurable bloom parameters (strength, radius, threshold)
- `BloomCompositorShader`: Custom shader for compositing bloom with normal scene

## Usage

1. Open the ForceGraph3D view with bloom effects (labeled "ForceGraph 3D V2 (Bloom)" with ✨ icon)
2. Select nodes by clicking on them
3. Watch as selected nodes glow with a beautiful bloom effect
4. The effect works with both single and multi-node selection

## Configuration

Bloom effect parameters can be adjusted in the component:

```typescript
const BLOOM_PARAMS = {
  strength: 1.5, // Bloom intensity
  radius: 0.4, // Bloom spread radius
  threshold: 0.85, // Brightness threshold for bloom
};
```

## Technical Details

### Dependencies

- Three.js ^0.172.0
- 3d-force-graph library
- Three.js post-processing examples

### Performance Considerations

- Bloom effect only renders when nodes are selected
- Efficient material caching and restoration
- Minimal impact on frame rate

## Future Enhancements

Potential improvements could include:

- Configurable bloom colors per node type
- Animated bloom intensity
- Edge bloom effects
- User-configurable bloom parameters via UI

## Troubleshooting

If the bloom effect isn't working:

1. Check browser console for error messages
2. Ensure Three.js version is compatible (^0.172.0+)
3. Verify that nodes are being selected properly
4. Check that the graph instance has proper renderer access

## Files Modified

- `src/components/views/ForceGraph3DViewV2WithBloom.tsx` (new)
- `src/components/views/AppShellView.tsx` (added view registration)
