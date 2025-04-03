
/**
 * Generates a random user ID for administrators
 */
export const generateUserId = (): string => {
  const prefix = 'ADM';
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${randomPart}-${timestamp}`;
};

/**
 * Generates a secure random password
 */
export const generatePassword = (length = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+=-';
  let password = '';
  
  // Ensure at least one character from each category
  password += charset.match(/[a-z]/)[0]; // lowercase
  password += charset.match(/[A-Z]/)[0]; // uppercase
  password += charset.match(/[0-9]/)[0]; // number
  password += charset.match(/[!@#$%^&*()_+=-]/)[0]; // special character
  
  // Fill the rest of the password
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

/**
 * Interface for team member data structure
 */
export interface TeamMember {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  avatar: string;
  last_active: string;
  is_super_admin: boolean;
  department_id: string;
  company?: string;
  position?: string;
  custom_id?: string; // Added custom_id property
}
