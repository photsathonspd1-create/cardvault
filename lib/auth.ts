import NextAuth from "next-auth"
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

/**
 * LINE OAuth Provider (custom, since next-auth doesn't ship a LINE provider)
 *
 * LINE Login uses OpenID Connect.
 * Docs: https://developers.line.biz/en/docs/line-login/integrate-line-login/
 */
interface LineProfile {
  sub: string
  name: string
  picture: string
  email?: string
}

function LineProvider(config: OAuthUserConfig<LineProfile>): OAuthConfig<LineProfile> {
  return {
    id: "line",
    name: "LINE",
    type: "oauth" as const,
    authorization: {
      url: "https://access.line.me/oauth2/v2.1/authorize",
      params: {
        scope: "profile openid email",
        response_type: "code",
      },
    },
    token: {
      url: "https://api.line.me/oauth2/v2.1/token",
    },
    userinfo: {
      url: "https://api.line.me/v2/profile",
    },
    profile(profile: LineProfile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email ?? null,
        image: profile.picture,
      }
    },
    style: {
      logo: "/line-logo.svg",
      bg: "#06C755",
      text: "#fff",
    } as any,
    ...config,
  } as any
}

// Build providers list — always include credentials, optionally add LINE
// Type-safe providers array — NextAuth v5 accepts Provider[]
import type { Provider } from "next-auth/providers"
const providers: Provider[] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "อีเมล", type: "email" },
      password: { label: "รหัสผ่าน", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("กรุณากรอกอีเมลและรหัสผ่าน")
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      })

      if (!user || !user.passwordHash) {
        throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
      }

      if (user.isBanned) {
        throw new Error("บัญชีนี้ถูกระงับการใช้งาน")
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password as string,
        user.passwordHash
      )

      if (!isPasswordValid) {
        throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.avatar,
      }
    },
  }),
]

// Add LINE provider if env vars are set
if (process.env.LINE_CLIENT_ID && process.env.LINE_CLIENT_SECRET) {
  providers.push(
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
    })
  )
}

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      // On LINE sign-in, link or create user
      if (account?.provider === "line" && user) {
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { lineId: account.providerAccountId },
              { email: user.email ?? "" },
            ],
          },
        })

        if (existingUser) {
          // Link LINE ID if not already linked
          if (!existingUser.lineId) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { lineId: account.providerAccountId },
            })
          }
          token.id = existingUser.id
        } else {
          // Create new user from LINE profile
          const newUser = await prisma.user.create({
            data: {
              email: user.email ?? `line_${account.providerAccountId}@cardvault.local`,
              name: user.name ?? "ผู้ใช้ LINE",
              username: `line_${account.providerAccountId.slice(0, 8)}`,
              lineId: account.providerAccountId,
              avatar: user.image,
              emailVerified: user.email ? new Date() : null,
            },
          })
          token.id = newUser.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string

        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            avatar: true,
            role: true,
            sellerProfile: {
              select: {
                id: true,
                displayName: true,
                tier: true,
              },
            },
          },
        })

        if (dbUser) {
          session.user = {
            ...session.user,
            id: dbUser.id,
            username: dbUser.username,
            role: dbUser.role,
            sellerProfile: dbUser.sellerProfile,
          } as typeof session.user & {
            username: string
            role: string
            sellerProfile: { id: string; displayName: string; tier: string } | null
          }
        }
      }
      return session
    },
  },
})
// LINE Login configured
