import Image from "next/image";
import type { Brewery } from "../api";
import { Link } from "./base";

export function BreweryCard(
  props: Pick<Brewery, "name" | "brewery_type" | "website_url"> & {
    image?: string;
  }
) {
  return (
    <aside>
      <h2>{props.name}</h2>
      <small>{props.brewery_type}</small>
      <div>
        {props.image ? (
          <Image src={props.image} width={640} height={480} alt={props.name} />
        ) : null}
      </div>
      {props.website_url && <Link href={props.website_url}>Website</Link>}
    </aside>
  );
}
