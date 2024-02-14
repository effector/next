import Link from "next/link";

import { AsyncCounter } from "#root/features/async-counter";
import { MemoUpdatesBugCheck } from "#root/features/memo-check";
import { ServerAction } from "#root/features/server-action";

const links = [
  {
    name: "Brewery of the day (gSSP)",
    href: "/brewery-of-the-day",
  },
  {
    name: "Brewery of the day (GIP)",
    href: "/brewery-of-the-day-gip",
  },
  {
    name: "Brewery of the day (RSC)",
    href: "/brewery-of-the-day-app",
  },
  { name: "Breweries (getStaticProps)", href: "/breweries-pages" },
  { name: "Breweries (App Mode)", href: "/breweries" },
];

export function PageLayout(props: React.PropsWithChildren<{}>) {
  return (
    <>
      <header style={{ paddingBottom: 0 }}>
        <div>
          <h1>
            <Link href="/">Breweries playground app</Link>
          </h1>
          <small>Playground app to research Next.js + Effector</small>
          <MemoUpdatesBugCheck />
          <ServerAction />
        </div>
        <AsyncCounter />
        <nav style={{ marginBottom: 0 }}>
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main>{props.children}</main>
      <footer></footer>
    </>
  );
}
