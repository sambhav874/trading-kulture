import type { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
      isProfileComplete: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
    isProfileComplete: boolean
  }
}

