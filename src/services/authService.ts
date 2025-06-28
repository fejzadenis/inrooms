import { 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  User,
  reload
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { toast } from 'react-hot-toast';

export const authService = {
  // Send email verification to the current user
  async sendEmailVerification(user: User): Promise<void> {
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/login?verified=true`,
        handleCodeInApp: false
      });
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error sending email verification:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many verification emails sent. Please wait before requesting another.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled. Please contact support.');
      } else {
        throw new Error('Failed to send verification email. Please try again.');
      }
    }
  },

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login?reset=true`,
        handleCodeInApp: false
      });
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many password reset attempts. Please wait before trying again.');
      } else {
        throw new Error('Failed to send password reset email. Please try again.');
      }
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
  requiresEmailVerification(user: User | null): boolean {
    if (!user) return false;
    
    // Skip verification for admin users or if already verified
    if (user.emailVerified) return false;
    
    // Check if user has admin email
    const adminEmails = ['admin@inrooms.com'];
    if (adminEmails.includes(user.email || '')) return false;
    
    return true;
  }
};