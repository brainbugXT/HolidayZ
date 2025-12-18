/**
 * Generate avatar URL from user's name
 * Uses UI Avatars service to create beautiful, consistent avatars with initials
 * @param name - User's full name
 * @param email - User's email (for color consistency)
 * @param size - Image size in pixels (default 80)
 * @returns Avatar URL
 */
export function getAvatarUrl(name: string, email: string, size: number = 80): string {
  const cleanEmail = email.toLowerCase().trim();
  
  // Generate consistent color based on email
  let hash = 0;
  for (let i = 0; i < cleanEmail.length; i++) {
    hash = cleanEmail.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Color palette matching the app theme
  const colors = [
    '4F46E5', // Indigo (primary)
    'EF4444', // Red
    '10B981', // Green
    'F59E0B', // Amber
    '8B5CF6', // Purple
    'EC4899', // Pink
    '14B8A6', // Teal
    'F97316', // Orange
  ];
  
  const colorIndex = Math.abs(hash) % colors.length;
  const bgColor = colors[colorIndex];
  
  // UI Avatars generates beautiful SVG avatars with initials
  // Free service, reliable, no authentication needed
  // Format: name=Full+Name&size=80&background=color&color=fff&bold=true
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=${bgColor}&color=fff&bold=true&format=svg&rounded=true`;
}

// Keep the old function name for backward compatibility
export function getGravatarUrl(email: string, size: number = 80): string {
  // Extract name from email for fallback
  const name = email.split('@')[0].replace(/[._-]/g, ' ');
  return getAvatarUrl(name, email, size);
}

/**
 * Get user initials from name for fallback avatar
 * @param name - User's full name
 * @returns User initials (e.g., "John Doe" -> "JD")
 */
export function getUserInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Generate a consistent color based on user name
 * @param name - User's name
 * @returns Hex color string
 */
export function getUserColor(name: string): string {
  const colors = [
    '#EF4444', // red
    '#F59E0B', // amber
    '#10B981', // green
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}
