import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      // GitHub
      { protocol: "https", hostname: "avatars.githubusercontent.com" },

      // Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com" },

      // ImageKit
      { protocol: "https", hostname: "ik.imagekit.io" },

      // Unsplash
      { protocol: "https", hostname: "images.unsplash.com" },

      // Pexels
      { protocol: "https", hostname: "images.pexels.com" },

      // Pixabay
      { protocol: "https", hostname: "cdn.pixabay.com" },

      // Freepik / Flaticon
      { protocol: "https", hostname: "img.freepik.com" },

      { protocol: "https", hostname: "media.flaticon.com" },

      // Pinterest
      { protocol: "https", hostname: "i.pinimg.com" },
      
      { protocol: "https", hostname: "s.pinimg.com" },

      // Google Photos / Blogger
      { protocol: "https", hostname: "lh3.googleusercontent.com" },

      // Twitter / X
      { protocol: "https", hostname: "pbs.twimg.com" },

      // Facebook CDN
      { protocol: "https", hostname: "scontent.xx.fbcdn.net" },

      // Reddit
      { protocol: "https", hostname: "preview.redd.it" },

      // Tumblr
      { protocol: "https", hostname: "64.media.tumblr.com" },

      // Shopify CDN
      { protocol: "https", hostname: "cdn.shopify.com" },

      // Medium
      { protocol: "https", hostname: "miro.medium.com" },

      // Vercel Blob URLs
      { protocol: "https", hostname: "public.blob.vercel-storage.com" },

      // Staticflickr
      { protocol: "https", hostname: "live.staticflickr.com" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "devlongruoi",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
