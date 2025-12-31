/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel の Serverless/Output Tracing で sqlite を同梱する
  // （DATABASE_URL 未設定でも最低限レンダリングが落ちないようにする）
  outputFileTracingIncludes: {
    "/**": ["prisma/dev.db", "prisma/schema.prisma"],
  },
};

export default nextConfig;
