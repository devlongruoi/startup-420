"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

/**
 * Global error boundary component that reports the provided error to Sentry and renders a generic Next.js error page.
 *
 * Reports `error` to Sentry when mounted or when `error` changes, then renders an HTML document containing Next.js's default error UI.
 *
 * @param error - The error to report and display; may include an optional `digest` property.
 * @returns The rendered HTML error page containing `NextError`.
 */
export default function GlobalError({ error }: Readonly<{ error: Error & { digest?: string } }>) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}