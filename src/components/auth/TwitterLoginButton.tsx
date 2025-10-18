
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function TwitterLoginButton() {
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
        redirect_uri: `${window.location.origin}/next_api/auth/x-callback`,
        response_type: 'code',
        scope: 'tweet.read users.read follows.read follows.write likes.read likes.write',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });

      const authUrl = `https://x.com/i/oauth2/authorize?${params.toString()}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('X login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={isLoading}
      className="w-full"
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
          <path d="M23.953 4.57a10 10 0 002.856-3.515 9.953 9.953 0 01-2.828.856 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
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
