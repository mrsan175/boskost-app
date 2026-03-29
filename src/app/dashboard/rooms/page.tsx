import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { rooms, properties, roomTenants, tenants } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { RoomsView } from "@/components/dashboard/RoomsView";

export default async function RoomsPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  // Fetch all properties for filter bar
  const propertyList = await db
    .select({ id: properties.id, name: properties.name })
    .from(properties)
    .where(and(eq(properties.ownerId, user.id), eq(properties.isActive, true)));

  // Fetch all rooms (initial data)
  const initialRooms = await db
    .select({
      id: rooms.id,
      roomNumber: rooms.roomNumber,
      floor: rooms.floor,
      status: rooms.status,
      pricePerMonth: rooms.pricePerMonth,
      notes: rooms.notes,
      isActive: rooms.isActive,
      propertyId: rooms.propertyId,
      propertyName: properties.name,
      tenantName: tenants.name,
      startDate: roomTenants.startDate,
      endDate: roomTenants.endDate,
    })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .leftJoin(roomTenants, and(eq(rooms.id, roomTenants.roomId), eq(roomTenants.isActive, true)))
    .leftJoin(tenants, eq(roomTenants.tenantId, tenants.id))
    .where(and(eq(properties.ownerId, user.id), eq(properties.isActive, true)))
    .orderBy(properties.name, rooms.floor, rooms.roomNumber);

  return (
    <RoomsView 
      initialRooms={initialRooms} 
      propertyList={propertyList} 
    />
  );
}
