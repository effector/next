import "zx/globals";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: { kind: string } }
) {
  const { cats } = await fs.readJson("./mocks.json");
  const { kind } = context.params;
  const resultCat = cats.find((cat: any) => cat.kind === kind);

  if (!resultCat) return new Response(null, { status: 404 })

  return NextResponse.json(resultCat);
}
