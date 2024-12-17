import { CodegenConfig } from '@graphql-codegen/cli'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const config: CodegenConfig = {
  schema: process.env.VITE_API_URL,
  generates: {
    './src/gql/': {
      preset: 'client',
      plugins: []
    }
  }
}

export default config 