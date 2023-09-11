'use client'

import { $currentPage } from "#root/shared/app";
import { useUnit } from "effector-react";
import { memo } from "react";

export function MemoUpdatesBugCheck() {
  return (
    <div>
      <MemoPage prefix="with memo" />
      <CurrentPage prefix="normal" />
    </div>
  );
}

function CurrentPage({ prefix }: { prefix: string }) {
  const page = useUnit($currentPage);

  return (
    <div>
      Current page: ({prefix}){page}
    </div>
  );
}

const MemoPage = memo(CurrentPage);
