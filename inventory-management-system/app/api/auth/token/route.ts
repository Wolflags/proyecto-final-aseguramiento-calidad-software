import { NextRequest, NextResponse } from 'next/server';

const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8180/auth';
const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'inventario-app';
const KEYCLOAK_CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'inventario-client';
const KEYCLOAK_CLIENT_SECRET = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET || 'wzlUSNeE5MRO2raNFSMrsUo6CENgSWzV';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grant_type, code, refresh_token, redirect_uri } = body;

    const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
    
    // Crear los parámetros para la solicitud de token
    const params = new URLSearchParams();
    params.append('client_id', KEYCLOAK_CLIENT_ID);
    params.append('client_secret', KEYCLOAK_CLIENT_SECRET);
    params.append('grant_type', grant_type);
    
    if (grant_type === 'authorization_code' && code && redirect_uri) {
      params.append('code', code);
      params.append('redirect_uri', redirect_uri);
    } else if (grant_type === 'refresh_token' && refresh_token) {
      params.append('refresh_token', refresh_token);
    } else {
      return NextResponse.json(
        { error: 'Invalid parameters for token request' },
        { status: 400 }
      );
    }
    
    console.log('Token request params:', Object.fromEntries(params.entries()));
    
    // Hacer la solicitud a Keycloak
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    
    if (!response.ok) {
      console.error('Error from Keycloak:', response.status, await response.text());
      return NextResponse.json(
        { error: `Error from Keycloak: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in token proxy:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
