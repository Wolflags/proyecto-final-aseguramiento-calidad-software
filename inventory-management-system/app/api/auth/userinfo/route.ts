import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // Extract the access token from the Authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Get environment variables
    const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
    const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
    
    if (!keycloakUrl || !realm) {
      console.error('Missing required environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const userinfoEndpoint = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/userinfo`;
    
    console.log(`Fetching user info from ${userinfoEndpoint}`);
    
    const response = await fetch(userinfoEndpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('User info request failed:', errorData);
      
      if (response.status === 401) {
        return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch user information', details: errorData },
        { status: response.status }
      );
    }

    const userData = await response.json();
    return NextResponse.json(userData);
    
  } catch (error) {
    console.error('Error in userinfo request:', error);
    return NextResponse.json(
      { error: 'Internal server error during user info request' },
      { status: 500 }
    );
  }
}
