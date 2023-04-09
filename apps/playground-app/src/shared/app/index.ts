import { createEffect, createEvent, createStore, sample } from "effector";

const pageTypes = ["companies", "company"] as const;

export const pageStarted = createEvent<{
  pageType: typeof pageTypes[number];
  pageCtx: unknown;
}>();

const $currentPage = createStore<typeof pageTypes[number] | null>(null).on(
  pageStarted,
  (_, { pageType }) => pageType
);

export function declarePage<Ctx = void>(config: {
  pageType: typeof pageTypes[number];
}) {
  const open = pageStarted.prepend((ctx: Ctx) => ({
    pageType: config.pageType,
    pageCtx: ctx,
  }));

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
  }).on(open, (_, pageCtx) => pageCtx);

  const $active = $currentPage.map((page) => page === config.pageType);
  const opened = sample({
    clock: $active,
    filter: Boolean,
    fn: () => {
      // void
    },
  });
  const closed = sample({
    clock: $active,
    filter: (active) => !active,
    fn: () => {
      // void
    },
  });

  $ctx.on(closed, () => null);

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
