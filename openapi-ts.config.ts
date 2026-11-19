import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: './openapi.yaml',
  output: 'src/api/generated',
  plugins: [
    '@hey-api/typescript',
    {
      name: '@hey-api/client-fetch',
      throwOnError: true,
    },
    {
      name: '@hey-api/sdk',
      // APIキーは client.ts でまとめて付与するため、SDK側の認証処理は生成しない
      auth: false,
    },
  ],
})
