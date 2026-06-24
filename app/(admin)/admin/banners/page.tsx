import { getAllBanners, createBannerAction } from "@/features/banner/actions";
import { BannerManager } from "@/components/banner-manager";
import { BannerForm } from "@/components/banner-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Banner — Admin",
};

export default async function AdminBannersPage() {
  const banners = await getAllBanners();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">
        Kelola Banner ({banners.length})
      </h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold">Tambah Banner</h2>
          <BannerForm />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">Daftar Banner</h2>
          <BannerManager banners={banners} />
        </div>
      </div>
    </main>
  );
}
