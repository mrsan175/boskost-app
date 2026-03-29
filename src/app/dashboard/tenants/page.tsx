import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tenants, roomTenants, rooms, properties } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { TenantsView } from "@/components/dashboard/TenantsView";

export default async function TenantsPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  // All tenants with their active lease + room info
  const initialTenants = await db
    .select({
      id: tenants.id,
      tenantName: tenants.name,
      email: tenants.email,
      phone: tenants.phone,
      isVerified: tenants.isVerified,
      isActive: roomTenants.isActive,
      startDate: roomTenants.startDate,
      endDate: roomTenants.endDate,
      roomNumber: rooms.roomNumber,
      floor: rooms.floor,
      propertyName: properties.name,
      propertyId: properties.id,
    })
    .from(tenants)
    .leftJoin(
      roomTenants,
      and(eq(roomTenants.tenantId, tenants.id), eq(roomTenants.isActive, true))
    )
    .leftJoin(rooms, eq(roomTenants.roomId, rooms.id))
    .leftJoin(properties, eq(rooms.propertyId, properties.id))
    .where(eq(tenants.ownerId, user.id))
    .orderBy(desc(tenants.createdAt));

  // Available rooms for the move dialog (status = available)
  const availableRoomRows = await db
    .select({
      roomId: rooms.id,
      roomNumber: rooms.roomNumber,
      floor: rooms.floor,
      propertyId: properties.id,
      propertyName: properties.name,
    })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(and(eq(properties.ownerId, user.id), eq(rooms.status, "available")))
    .orderBy(properties.name, rooms.roomNumber);

  return (
    <TenantsView 
      initialTenants={initialTenants} 
      availableRooms={availableRoomRows} 
    />
  );
}
