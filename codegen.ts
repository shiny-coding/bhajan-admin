import { CodegenConfig } from '@graphql-codegen/cli'
import { remoteUrl } from './src/App'

const config: CodegenConfig = {
  schema: remoteUrl,
  generates: {
    './src/gql/': {
      preset: 'client',
      plugins: []
    }
  }
}

export default config 