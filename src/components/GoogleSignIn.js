import React, { useEffect } from 'react';
import './GoogleSignIn.css';

const GoogleSignIn = ({ onSuccess, onError }) => {
  const clientId = "727073529362-3s9hd8s2mepg16reruij6lulmpueklae.apps.googleusercontent.com";

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            theme: "outline",
            size: "large",
            width: 300,
            text: "signin_with",
            shape: "rectangular"
          }
        );
      }
    };

    const loadGoogleScript = () => {
      if (!document.getElementById('google-identity-script')) {
        const script = document.createElement('script');
        script.id = 'google-identity-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        document.head.appendChild(script);
      } else {
        initializeGoogleSignIn();
      }
    };

    loadGoogleScript();
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      console.log('Google credential response received:', response);
      const token = response.credential;
      
      if (!token) {
        throw new Error('No credential token received from Google');
      }
      
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded Google token:', decodedToken);
      
      const userData = {
        name: decodedToken.name,
        email: decodedToken.email,
        googleId: decodedToken.sub,
        picture: decodedToken.picture,
        role: 'customer'
      };

      console.log('Sending to backend:', userData);
      const backendResponse = await fetch('http://localhost:5001/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, userData }),
      });

      console.log('Backend response status:', backendResponse.status);
      const result = await backendResponse.json();
      console.log('Backend response:', result);

      if (backendResponse.ok) {
        console.log('Google sign-in successful:', result.user);
        onSuccess(result.user);
      } else {
        console.error('Backend error:', result);
        onError(result.error || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      onError(`Failed to process Google sign-in: ${error.message}`);
    }
  };

  return (
    <div className="google-signin-container">
      <div id="google-signin-button"></div>
    </div>
  );
};

export default GoogleSignIn;
