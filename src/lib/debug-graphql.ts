// Diagnostic helper - run this in browser console
// This will help identify the root cause of the "Failed to fetch" error

export async function diagnoseGraphQLConnection() {
  console.log('🔍 GraphQL Connection Diagnostic');
  console.log('================================\n');

  const apiUrl = 'https://wed.usewebs.com/gamegear/backend/graphql';
  
  // 1. Check URL format
  console.log('1️⃣ URL Format Check:');
  console.log('✅ Using hardcoded URL:', apiUrl);

  // 3. Test basic connectivity
  console.log('\n2️⃣ Network Connectivity Test:');
  try {
    const testRes = await fetch(apiUrl, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });
    console.log('✅ Server is reachable (HTTP', testRes.status, ')');
  } catch (e) {
    console.error('❌ Cannot reach server:', e.message);
    console.log('   Check:');
    console.log('   - Is WordPress running?');
    console.log('   - Is the URL correct?');
    console.log('   - Are there firewall/proxy issues?');
    return;
  }

  // 4. Test GraphQL endpoint
  console.log('\n3️⃣ GraphQL Endpoint Test:');
  try {
    const gqlRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query { __typename }`,
      }),
    });

    const data = await gqlRes.json();
    
    if (gqlRes.ok) {
      console.log('✅ GraphQL endpoint is working');
      console.log('   Response:', data);
    } else {
      console.error('❌ GraphQL returned error:');
      console.log('   Status:', gqlRes.status);
      console.log('   Response:', data);
    }
  } catch (e) {
    console.error('❌ GraphQL test failed:', e.message);
    console.log('   This might be a CORS issue');
  }

  // 5. Check Cart-Token
  console.log('\n4️⃣ Cart Token Check:');
  import { getSessionToken } from '@/lib/session';
  const token = getSessionToken();
  if (token) {
    console.log('✅ Cart-Token present:', token.substring(0, 20) + '...');
  } else {
    console.log('⚠️ No Cart-Token yet (will be created on first request)');
  }

  console.log('\n================================');
  console.log('Diagnostic complete!');
}

// Usage: window.diagnoseGraphQL = diagnoseGraphQLConnection; 
// Then call: diagnoseGraphQL()
