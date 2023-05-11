import { Link } from "#root/shared/ui";

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
];

export function PageLayout(props: React.PropsWithChildren<{}>) {
  return (
    <>
      <header>
        <div>
          <h1>
            <Link href="/">Breweries playground app</Link>
          </h1>
          <small>Playground app to research Next.js + Effector</small>
        </div>
        <nav>
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
