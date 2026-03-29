"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

export function TenantSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "newest";

  const handleSort = (val: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", val);
    params.set("page", "1"); // Reset pagination on sort change
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium whitespace-nowrap hidden sm:inline" style={{ color: "var(--on-surface-variant)" }}>
        Urutkan:
      </span>
      <Select value={currentSort} onValueChange={handleSort}>
        <SelectTrigger className="w-[140px] sm:w-[160px] h-9 rounded-xl text-xs bg-transparent border-outline-variant">
          <SelectValue placeholder="Pilih urutan..." />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-outline-variant">
          <SelectItem value="newest" className="text-xs rounded-lg cursor-pointer">Terbaru Ditambahkan</SelectItem>
          <SelectItem value="oldest" className="text-xs rounded-lg cursor-pointer">Terlama Ditambahkan</SelectItem>
          <SelectItem value="name_asc" className="text-xs rounded-lg cursor-pointer">Nama (A-Z)</SelectItem>
          <SelectItem value="name_desc" className="text-xs rounded-lg cursor-pointer">Nama (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function TenantPagination({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const navigate = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: "var(--outline-variant)" }}>
      <Button 
        variant="outline" 
        size="sm" 
        className="rounded-xl h-9 px-3 border-outline-variant text-[11px] font-bold"
        onClick={() => navigate(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={14} className="sm:mr-1.5" />
        <span className="hidden sm:inline">Sebelumnya</span>
      </Button>
      
      <div className="flex items-center gap-2 px-3 text-[11px] font-bold" style={{ color: "var(--on-surface-variant)" }}>
        Halaman {currentPage} dari {totalPages}
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        className="rounded-xl h-9 px-3 border-outline-variant text-[11px] font-bold"
        onClick={() => navigate(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <span className="hidden sm:inline">Selanjutnya</span>
        <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="sm:ml-1.5" />
      </Button>
    </div>
  );
}
