import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { name: {}, password: {} },
      authorize: async (creds) => {
        console.log('--- LOGIN ATTEMPT ---')
        console.log('name reçu:', JSON.stringify(creds?.name))
        console.log('name attendu:', JSON.stringify(process.env.ADMIN_USERNAME))
        console.log('hash présent ?', !!process.env.ADMIN_PASSWORD_HASH)

        if (creds?.name !== process.env.ADMIN_USERNAME) {
          console.log('❌ échec sur le nom')
          return null
        }

        const valid = await bcrypt.compare(
          creds?.password as string,
          process.env.ADMIN_PASSWORD_HASH as string
        )
        console.log('mot de passe valide ?', valid)

        if (!valid) {
          console.log('❌ échec sur le mot de passe')
          return null
        }

        return { id: '1', name: creds.name as string }
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
})