/**
 * Utility function to handle image URLs consistently across the application
 * Supports both external URLs (Unsplash, etc.) and local uploads
 */

export const getImageUrl = (imagePath, fallback = "/images/placeholder-food.jpg") => {
  if (!imagePath) return fallback;
  
  try {
    // If it's already a full URL (Unsplash, external sources), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it's a local upload path
    const cleanPath = imagePath.replace(/^\/+/, '');
    
    // Check if it already includes uploads in the path
    if (cleanPath.includes('uploads')) {
      return `http://localhost:8080/${cleanPath}`;
    }
    
    // Default to uploads folder
    return `http://localhost:8080/uploads/${cleanPath}`;
    
  } catch (error) {
    console.error('Error formatting image URL:', error);
    return fallback;
  }
};

/**
 * Get image URL specifically for menu items
 */
export const getMenuImageUrl = (imagePath) => {
  return getImageUrl(imagePath, "/images/placeholder-menu.jpg");
};

/**
 * Handle image error by setting fallback
 */
export const handleImageError = (e, fallback = "/images/placeholder-food.jpg") => {
  e.target.src = fallback;
  e.target.onerror = null; // Prevent infinite loop
};

/**
 * Handle menu image error
 */
export const handleMenuImageError = (e) => {
  handleImageError(e, "/images/placeholder-menu.jpg");
};
