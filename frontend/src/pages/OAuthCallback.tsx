import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your login...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const userId = searchParams.get('userId');
      const email = searchParams.get('email');
      const name = searchParams.get('name');
      const role = searchParams.get('role');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        let errorMessage = 'Authentication failed. Please try again.';

        switch (error) {
          case 'google_not_configured':
            errorMessage = 'Google login is not configured. Please use email/password.';
            break;
          case 'facebook_not_configured':
            errorMessage = 'Facebook login is not configured. Please use email/password.';
            break;
          case 'google_auth_failed':
            errorMessage = 'Google authentication failed. Please try again.';
            break;
          case 'facebook_auth_failed':
            errorMessage = 'Facebook authentication failed. Please try again.';
            break;
          case 'facebook_no_email':
            errorMessage = 'Could not retrieve email from Facebook. Please ensure your Facebook account has an email address or use email/password login.';
            break;
        }

        setMessage(errorMessage);
        toast.error('Login failed', { description: errorMessage });

        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }

      if (!accessToken || !refreshToken) {
        setStatus('error');
        setMessage('Invalid authentication response. Please try again.');
        toast.error('Login failed', { description: 'Invalid authentication response' });

        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }

      try {
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Refresh user data in context
        await refreshUser();

        setStatus('success');
        setMessage(`Welcome${name ? `, ${name}` : ''}!`);
        toast.success('Login successful!', {
          description: 'You have been signed in successfully.',
        });

        // Redirect based on role
        setTimeout(() => {
          if (role === 'ADMIN') {
            navigate('/admin');
          } else {
            const selectedCountry = localStorage.getItem('selectedCountry');
            navigate(selectedCountry ? '/ready' : '/select-country');
          }
        }, 1500);
      } catch (err) {
        setStatus('error');
        setMessage('Failed to complete authentication. Please try again.');
        toast.error('Login failed', { description: 'Failed to complete authentication' });

        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Signing you in</h2>
              <p className="text-muted-foreground mt-2">{message}</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">{message}</h2>
              <p className="text-muted-foreground mt-2">Redirecting you now...</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Authentication Failed</h2>
              <p className="text-muted-foreground mt-2">{message}</p>
              <p className="text-sm text-muted-foreground mt-4">Redirecting to login page...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
