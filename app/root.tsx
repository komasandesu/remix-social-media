import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Social Media" },
    {
      property: "og:title",
      content: "Remix Social Media",
    },
    { name: 'description', content: 'SNSです' },
    { property: 'og:description', content: 'SNSです' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'RSM' },
    { property: 'og:url', content: 'https://socialmedia.at-math.com/' },
    { property: 'og:image', content: 'https://socialmedia.at-math.com/og-image.png' },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
      <div>
        <Outlet /> {/* ページごとのコンテンツがここにレンダリングされる */}
      </div>
  );
}
