import "zx/globals";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await fs.readJson("./mocks.json");

  return NextResponse.json(data.companies);
}
