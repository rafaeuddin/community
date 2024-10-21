import NextAuth, { User } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { Session } from "next-auth"
import { JWT } from "next-auth/jwt"


export const authOptions = {
    // Configure one or more authentication providers
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Member ID", type: "string" },
          password: { label: "Password", type: "password" },
        },
        authorize: async (credentials, req) => {
         // To Do: Authorize the user
         if (credentials?.email=== "admin" && credentials?.password === "password") {
            return { id: "1", name: "Admin", email: "admin@example.com" }
          }
          return null
        },
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_ID || "",
        clientSecret: process.env.GOOGLE_SECRET || "",
      }),
      GithubProvider({
        clientId: process.env.GITHUB_ID || "",
        clientSecret: process.env.GITHUB_SECRET || "",
      }),
      // ...add more providers here
    ],
  
    pages:{
      signIn: "/login",
      error: "/error",
    },
    callbacks: {
      async session({ session, token }: { session: Session; token: JWT }) {
       
        return session;
      },
      async jwt({ token, user }: { token: JWT; user: User }) {
        return { ...token, ...user }
      },
    },
}




