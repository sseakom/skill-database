import type { NextConfig } from "next";

// 纯前端静态站：构建期导出，运行时零数据库依赖
// 部署到 Vercel 原生支持；部署到 GitHub Pages 需额外设置 basePath
const nextConfig: NextConfig = {
  output: "export",
  // 静态导出无服务端图片优化
  images: {
    unoptimized: true,
  },
  // 开发期严格模式
  reactStrictMode: true,
};

export default nextConfig;
