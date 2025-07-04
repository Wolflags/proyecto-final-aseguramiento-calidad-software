import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"

const clientId = "inventario-frontend"
const issuer = "http://localhost:9090/realms/InventarioRealm"

// Interfaces para tipos
interface KeycloakProfile {
  sub: string
  name?: string
  email?: string
  preferred_username?: string
  realm_access?: {
    roles?: string[]
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "keycloak-pkce",
      name: "Keycloak",
      type: "oauth",
      wellKnown: `${issuer}/.well-known/openid-configuration`,
      clientId: clientId,
      clientSecret: undefined, // Cliente público sin secreto
      client: {
        // 🔑 ESTA ES LA LÍNEA CLAVE QUE FALTABA
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
      
      return token
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken as string
        session.user.username = token.username as string
        session.user.roles = token.roles as string[]
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: "jwt"
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }