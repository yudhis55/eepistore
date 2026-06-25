import { getAllBanners } from "@/features/banner/actions";
import { BannerManager } from "@/components/banner-manager";
import { BannerForm } from "@/components/banner-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Banner — Admin",
};

export default async function AdminBannersPage() {
  const banners = await getAllBanners();

  return (
    <>
      <PageHeader
        title="Kelola Banner"
        description={`Kelola banner promosi homepage — ${banners.length} banner`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-brand-navy-900">Tambah Banner</h2>
          </CardHeader>
          <CardBody>
            <BannerForm />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-brand-navy-900">Daftar Banner</h2>
          </CardHeader>
          <CardBody>
            <BannerManager banners={banners} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
