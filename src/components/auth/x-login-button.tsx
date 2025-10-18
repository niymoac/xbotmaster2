'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface XLoginButtonProps {
  size?: 'default' | 'sm' | 'lg';
}

export function XLoginButton({ size = 'default' }: XLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      
      // PKCE parametreleri oluştur
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateRandomString();

      // PKCE parametrelerini sessionStorage'a kaydet
      sessionStorage.setItem('x_code_verifier', codeVerifier);
      sessionStorage.setItem('x_state', state);

      // Authorization URL'sini oluştur
      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_X_CLIENT_ID || '',
        redirect_uri: `${window.location.origin}/api/auth/x-callback`,
        response_type: 'code',
        scope: 'tweet.read users.read follows.read follows.write likes.read likes.write',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });

      const authUrl = `https://x.com/i/oauth2/authorize?${params.toString()}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('X giriş hatası:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      size={size}
      className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )}
      <span className="text-sm font-medium ml-2">X ile Giriş Yap</span>
    </Button>
  );
}

// PKCE helper functions
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateRandomString(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}