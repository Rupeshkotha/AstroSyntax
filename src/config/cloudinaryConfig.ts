export const CLOUDINARY_CLOUD_NAME = 'dkm53hnhx';

// Cloudinary upload preset - must be an "unsigned" upload preset
// The error "Upload preset must be whitelisted for unsigned uploads" means
// you need to create a specific unsigned upload preset in your Cloudinary dashboard:
// 1. Go to Settings > Upload > Upload presets
// 2. Click "Add upload preset"
// 3. Give it a name (e.g., "astrosyntax_unsigned")
// 4. Set "Signing Mode" to "Unsigned"
// 5. Save the preset
// 6. Update the value below with your new preset name
export const CLOUDINARY_UPLOAD_PRESET = 'profile';