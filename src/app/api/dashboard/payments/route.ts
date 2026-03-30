import { NextResponse } from "next/server";
import { currentUser } from "@/lib/serverAuth";
import { getPayments } from "@/lib/actions/payment";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const payments = await getPayments();
    return NextResponse.json(payments);
  } catch (error) {
    console.error("[PAYMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
