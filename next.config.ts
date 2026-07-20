import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["unpdf", "pdfjs-dist"],
  // Keep tracing rooted at this app when a parent folder also has a lockfile.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
