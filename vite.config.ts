import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import typescript from 'rollup-plugin-typescript2'
import * as ts from 'typescript'

export default defineConfig({
  esbuild: false,
  plugins: [
    {
      ...typescript({
        typescript: ts,
        tsconfig: './tsconfig.app.json',
        tsconfigOverride: {
          compilerOptions: {
            allowImportingTsExtensions: false,
            noEmit: false,
            sourceMap: true,
            inlineSourceMap: false,
            inlineSources: true,
            sourceRoot: '/',
            jsx: "react-jsx",
            outDir: "./dist/ts-build",
            moduleResolution: "bundler",
            allowJs: true,
            resolveJsonModule: true,
            strict: false,
            noImplicitAny: false
          }
        },
        check: true,
        include: ["src/**/*.ts", "src/**/*.tsx"]
      }),
      enforce: 'pre'
    },
    react()
  ],
  build: {
    sourcemap: true
  }
})
