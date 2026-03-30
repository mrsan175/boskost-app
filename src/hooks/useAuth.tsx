"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function useAuth() {
  const { data, error } = useSWR("/api/auth/me", fetcher);
  return { user: data?.user ?? null, loading: !error && !data, error };
}
