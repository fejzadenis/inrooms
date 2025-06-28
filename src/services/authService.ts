import { 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  User,
  reload
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { toast } from 'react-hot-toast';

export const authService = {
  // Send email verification to current user
  async sendEmailVerification(user: User): Promise<void> {
    try {
      await sendEmailVerification(user);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error sending email verification:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please wait before requesting another verification email.');
      } else if (error.code === 'auth/user-disabled') {
        toast.error('This account has been disabled.');
      } else {
        toast.error('Failed to send verification email. Please try again.');
      }
      throw error;
    }
  },

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please wait before requesting another reset email.');
      } else {
        toast.error('Failed to send password reset email. Please try again.');
      }
      throw error;
    }
  },

  // Check if user's email is verified
  isEmailVerified(user: User | null): boolean {
    return user?.emailVerified || false;
  },

  // Reload user to get updated email verification status
  async reloadUser(user: User): Promise<void> {
    try {
      await reload(user);
    } catch (error) {
      console.error('Error reloading user:', error);
    }
  },

  // Check if email verification is required for the user
  shouldShowEmailVerification(user: User | null): boolean {
    if (!user) return false;
    
    // Don't show for admin users or if already verified
    if (user.emailVerified) return false;
    
    // Show for regular users who haven't verified their email
    return true;
  }
};