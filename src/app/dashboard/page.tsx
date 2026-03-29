import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import StatCards from "@/components/dashboard/StatCards";
import RevenueOverview from "@/components/dashboard/RevenueOverview";
import PropertyPerformance from "@/components/dashboard/PropertyPerformance";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import RoomOverview from "@/components/dashboard/RoomOverview";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardPage() {
    const user = await currentUser();
    if (!user) redirect("/");

    const firstName = user.firstName || "User";
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

    const [userData] = await db
        .select({ subscriptionTier: users.subscriptionTier })
        .from(users)
        .where(eq(users.id, user.id));

    const isFree = !userData || userData.subscriptionTier === "FREE";

    return (
        <div style={{ background: "var(--surface)", fontFamily: "var(--font-body)" }}>
            <DashboardSidebar isFree={isFree} />
            <DashboardTopbar fullName={fullName} tier={userData?.subscriptionTier} />

            {/* Main Content */}
            <main className="min-h-screen p-4 sm:p-8 pt-24 lg:pt-[88px] lg:ml-64 transition-all duration-300">

                {/* Welcome Header */}
                <header className="mb-8 lg:mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h2
                            className="text-3xl font-extrabold tracking-tight"
                            style={{ color: "var(--on-surface)", fontFamily: "var(--font-display)" }}
                        >
                            Selamat datang, {firstName}!
                        </h2>
                        <p className="mt-1 text-sm" style={{ color: "var(--on-surface-variant)" }}>
                            Berikut adalah informasi properti Anda hari ini.
                        </p>
                    </div>
                    {/* <Button
                        className="shine-on-hover rounded-full px-6 gap-2 font-bold text-white shadow-lg"
                        style={{ background: "var(--gradient-cta)" }}
                    >
                        <HugeiconsIcon icon={Add01Icon} size={16} />
                        Tambah Properti
                    </Button> */}
                </header>

                {/* ── Stat Cards ── */}
                <StatCards />

                {/* ── Dashboard Content Grid ── */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                    {/* Left: Main Metrics (2/3 width) */}
                    <section className="space-y-8 lg:col-span-2">
                        <RevenueOverview />
                        <RoomOverview />
                        <PropertyPerformance />
                    </section>

                    {/* Right: Sidebar Activity (1/3 width) */}
                    <aside>
                        <ActivityFeed />
                    </aside>

                </div>


                <div className="h-12" />
            </main>

        </div>
    );
}