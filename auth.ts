import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { name: {}, password: {} },
      authorize: async (creds) => {
        // ADMIN_PASSWORD_HASH_B64 : le hash bcrypt (format $2b$10$...) est stocké encodé en
        // base64 côté Vercel — la valeur brute avec des `$` finit vide au runtime (l'injection
        // des env vars Vercel altère les valeurs contenant des séquences `$<chiffre>`).
        const hashB64 = process.env.ADMIN_PASSWORD_HASH_B64
        const hash = hashB64 ? Buffer.from(hashB64, 'base64').toString('utf8') : ''

        if (creds?.name !== process.env.ADMIN_USERNAME) {
          return null
        }

        const valid = await bcrypt.compare(creds?.password as string, hash)

        if (!valid) {
          return null
        }

        return { id: '1', name: creds.name as string }
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
})