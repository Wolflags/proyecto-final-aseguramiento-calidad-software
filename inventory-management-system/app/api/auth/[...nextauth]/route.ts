import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"

const clientId = process.env.KEYCLOAK_CLIENT_ID || "inventario-frontend"
const issuer = process.env.KEYCLOAK_ISSUER || "http://localhost:9090/realms/InventarioRealm"

interface KeycloakProfile {
  sub: string
  name?: string
  email?: string
  preferred_username?: string
  realm_access?: {
    roles?: string[]
  }
}

// Función para validar token con Keycloak
async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${issuer}/protocol/openid-connect/userinfo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.ok
  } catch (error) {
    return false
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    {
      id: "keycloak-pkce",
      name: "Keycloak",
      type: "oauth",
      wellKnown: `${issuer}/.well-known/openid-configuration`,
      clientId: clientId,
      clientSecret: undefined,
      client: {
        token_endpoint_auth_method: "none"
      },
      authorization: { 
        params: { 
          scope: "openid profile email",
          response_type: "code",
        } 
      },
      profile(profile: KeycloakProfile) {
        return {
          id: profile.sub,
          name: profile.name || profile.preferred_username,
          email: profile.email,
          username: profile.preferred_username,
          roles: profile.realm_access?.roles || []
        }
      },
      checks: ["pkce", "state"],
    }
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // En el primer login
      if (account?.access_token) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = Date.now() + (Number(account.expires_in) || 3600) * 1000
      }
      
      if (profile) {
        const keycloakProfile = profile as KeycloakProfile
        token.username = keycloakProfile.preferred_username
        token.roles = keycloakProfile.realm_access?.roles || []
      }

      // VALIDAR TOKEN EN CADA REQUEST
      if (token.accessToken) {
        const isValid = await validateToken(token.accessToken as string)
        if (!isValid) {
          // Token inválido, forzar logout
          console.log('Token invalidado por Keycloak, limpiando sesión')
          return {}
        }
      }
      
      return token
    },
    async session({ session, token }) {
      // Si el token está vacío (invalidado), no crear sesión
      if (!token.accessToken) {
        return {} as any
      }

      session.accessToken = token.accessToken as string
      session.user.username = token.username as string
      session.user.roles = token.roles as string[]
      
      return session
    }
  },
  events: {
    // Evento cuando se invalida sesión
    async signOut({ token }) {
      if (token?.accessToken) {
        // Opcional: Llamar al logout endpoint de Keycloak
        try {
          await fetch(`${issuer}/protocol/openid-connect/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: clientId,
              refresh_token: token.refreshToken as string || '',
            }),
          })
        } catch (error) {
          console.error('Error al invalidar en Keycloak:', error)
        }
      }
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutos
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }