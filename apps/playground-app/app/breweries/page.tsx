import {
  BreweriesPage,
  breweriesPage,
} from "#root/page-content/breweries-list";
import { EffectorNext } from "@effector/next";
import { allSettled, fork, serialize } from "effector";
import { AsyncCounter } from '#root/features/async-counter'
import { TestBtn } from '#root/features/test/testBtn'

export const revalidate = 1;

export default function Page() {
  return (
    <div>
      <AsyncCounter/>
      <TestBtn/>
      <BreweriesPage />
    </div>
  );
}
