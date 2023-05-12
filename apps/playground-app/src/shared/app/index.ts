import { createEffect, createEvent, createStore, sample } from "effector";

const pageTypes = ["breweryOfTheDay", "breweries", "brewery"] as const;

export const pageStarted = createEvent<{
  pageType: (typeof pageTypes)[number];
  pageCtx: unknown;
}>();

const $currentPage = createStore<(typeof pageTypes)[number] | null>(null).on(
  pageStarted,
  (_, { pageType }) => pageType
);

export function declarePage<Ctx = void>(config: {
  pageType: (typeof pageTypes)[number];
  contextContract?: {
    isData: (data: unknown) => data is Ctx;
  };
}) {
  const open = createEvent<Ctx>();

  const $ctx = createStore<Ctx | null>(null, {
    /**
     * Custom human-readable sid for easier debugging
     *
     * Completely optional practice, can be changed to factories field at
     * effector's babel/swc plugin configuration like this:
     * ```json
     *  factories: ["#root/shared/app"]
     * ```
     *
     * See the docs on SIDs: https://effector.dev/docs/api/effector/babel-plugin#sid
     */
    sid: `pageCtx:${config.pageType}`,
  });

  sample({
    clock: open,
    filter: (rawCtx) => {
      if (config.contextContract) {
        return config.contextContract.isData(rawCtx);
      }

      /**
       * Skip as-is, if no contract is provided
       */

      return true;
    },
    target: [
      $ctx,
      pageStarted.prepend((ctx: Ctx) => ({
        pageCtx: ctx,
        pageType: config.pageType,
      })),
    ],
  });

  const $active = $currentPage.map((page) => page === config.pageType);
  const activated = sample({
    clock: $active,
    filter: Boolean,
  });
  const deactivated = sample({
    clock: $active,
    filter: (active) => !active,
  });

  const opened = createEvent<Ctx>();
  const closed = createEvent<Ctx>();

  sample({
    clock: activated,
    source: $ctx,
    /**
     * Type assertion is totally fine here, as we know that $ctx will be of Ctx type at this moment,
     * because it is the way this logic is written and also here we have a contract check for that
     *
     * We can't (yet?) express it in the TypeScript type system though, hence the `as Ctx` cast
     *
     * In real-world apps it is better to write some tests for such cases, rather than
     * writing more complicated code to satisfy the type inference system
     */
    fn: (ctx) => ctx as Ctx,
    target: opened,
  });

  sample({
    clock: deactivated,
    source: $ctx,
    fn: (ctx) => ctx as Ctx,
    target: closed,
  });

  sample({
    clock: closed,
    fn: () => null,
    target: $ctx,
  });

  return {
    open,
    opened,
    closed,
    $active,
  };
}

export const showAlertFx = createEffect((msg: string) => {
  globalThis.alert && globalThis.alert(msg);
  console.error(msg);
});

export const $isClient = createStore(typeof document !== "undefined", {
  /**
   * "isClient" should not be serialized, as it is a separate value for both server and client
   */
  serialize: "ignore",
});
