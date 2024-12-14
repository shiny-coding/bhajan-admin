import { CodegenConfig } from '@graphql-codegen/cli'

const remoteUrl = 'https://bhajan.miracall.net/api'
const localUrl = 'http://localhost:4000'

const config: CodegenConfig = {
  schema: localUrl,
  generates: {
    './src/gql/': {
      preset: 'client',
      plugins: []
    }
  }
}

export default config 