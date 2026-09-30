import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Connexion directe port 5432, pas le pooler. Lue sans `env()`, qui lève une erreur si la
    // variable manque : `prisma generate` (postinstall) n'a pas besoin de base, et les préviews
    // Vercel n'ont pas les secrets de production — sans cela, leur `npm install` échoue.
    // Une commande qui touche vraiment la base (migrate, db push) échouera toujours sans URL.
    url: process.env.DIRECT_URL ?? '',
  },
})