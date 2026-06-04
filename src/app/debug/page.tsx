// Debug page to check cart token status
'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [cookiesStr, setCookiesStr] = useState<string>('');

  useEffect(() => {
    const checkToken = async () => {
      try {
        // Make a request to the proxy to see what happens
        const res = await fetch('/api/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            query: `query { __typename }`,
          }),
        });

        const data = await res.json();
        
        setStatus(JSON.stringify(data, null, 2));

        // Check cookies
        const cookies = document.cookie;
        console.log('Cookies:', cookies);
        setCookiesStr(cookies);

        // Try to read the token from cookies manually
        const tokenMatch = cookies.match(/woocommerce-session=([^;]+)/);
        if (tokenMatch) {
          setToken(tokenMatch[1]);
        }
      } catch (error) {
        setStatus('Error: ' + (error as Error).message);
      }
    };

    checkToken();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Session Diagnostic</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Session Status:</h2>
        <p>{token ? `Active Token: ${token.substring(0, 30)}...` : 'No Active Session Token'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>GraphQL API Response:</h2>
        <pre style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          borderRadius: '4px',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {status}
        </pre>
      </div>

      <div>
        <h2>Client Cookies:</h2>
        <pre style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          borderRadius: '4px'
        }}>
          {cookiesStr || 'No cookies present'}
        </pre>
      </div>
    </div>
  );
}
