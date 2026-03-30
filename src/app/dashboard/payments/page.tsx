import { currentUser } from "@/lib/serverAuth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PaymentsView } from "@/components/dashboard/PaymentsView";
import { getPayments } from "@/lib/actions/payment";

export default async function PaymentsPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  // Subscription check
  const [userData] = await db
    .select({ subscriptionTier: users.subscriptionTier })
    .from(users)
    .where(eq(users.id, user.id));

  const initialPayments = await getPayments();

  return (
    <div className="flex-1 overflow-auto bg-transparent">
      <PaymentsView initialPayments={initialPayments} />
    </div>
  );
}
