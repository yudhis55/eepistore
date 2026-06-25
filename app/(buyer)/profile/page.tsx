import { getMyProfile, getMyAddresses } from "@/features/profile/actions";
import { ProfileForm } from "@/components/profile-form";
import { AddressManager } from "@/components/address-manager";
import { VerificationForm } from "@/components/verification-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil — EEPISTORE",
};

export default async function ProfilePage() {
  const [profile, addresses] = await Promise.all([getMyProfile(), getMyAddresses()]);

  if (!profile) {
    return (
      <>
        <PageHeader title="Profil Saya" />
        <EmptyState
          title="Profil tidak ditemukan"
          description="Data profil Anda tidak dapat ditemukan. Coba muat ulang halaman atau hubungi dukungan."
          action={
            <Link className={buttonVariants({ variant: "secondary" })} href="/account">
              Kembali ke Akun
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Profil Saya"
        description="Kelola informasi akun, alamat, dan verifikasi mahasiswa Anda."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile info */}
        <Card>
          <CardBody>
            <h2 className="mb-4 text-sm font-semibold text-brand-navy-900">Informasi Akun</h2>
            <ProfileForm profile={profile} />
          </CardBody>
        </Card>

        {/* Addresses */}
        <Card>
          <CardBody>
            <h2 className="mb-4 text-sm font-semibold text-brand-navy-900">Alamat</h2>
            <AddressManager addresses={addresses} />
          </CardBody>
        </Card>
      </div>

      {/* Account info */}
      <Card className="mt-6">
        <CardBody>
          <h2 className="mb-3 text-sm font-semibold text-brand-navy-900">Detail Akun</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-neutral-500">Role</span>
              <p className="font-medium">{profile.role}</p>
            </div>
            <div>
              <span className="text-neutral-500">Email</span>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <span className="text-neutral-500">NIM</span>
              <p className="font-mono font-medium tabular-nums">{profile.nim ?? "-"}</p>
            </div>
            <div>
              <span className="text-neutral-500">Verified Student</span>
              <p className="font-medium">
                {profile.isVerifiedStudent ? (
                  <Badge variant="success">Terverifikasi</Badge>
                ) : (
                  <Badge variant="neutral">Belum</Badge>
                )}
              </p>
            </div>
            <div>
              <span className="text-neutral-500">Bergabung</span>
              <p className="font-medium">
                {new Date(profile.createdAt).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Student verification */}
      {!profile.isVerifiedStudent && (
        <Card className="mt-6 border-brand-gold-500/30 bg-brand-gold-500/5">
          <CardBody>
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-sm font-semibold text-brand-navy-900">Verified Student Badge</h2>
              {profile.verificationStatus === "PENDING" && (
                <Badge variant="warning">Dalam Review</Badge>
              )}
              {profile.verificationStatus === "REJECTED" && <Badge variant="danger">Ditolak</Badge>}
              {profile.verificationStatus === "NONE" && (
                <Badge variant="neutral">Belum Diajukan</Badge>
              )}
            </div>
            {profile.verificationStatus === "PENDING" ? (
              <p className="text-sm text-neutral-500">
                Pengajuan verifikasi Anda sedang dalam review Admin.
              </p>
            ) : profile.verificationStatus === "REJECTED" ? (
              <p className="text-sm text-danger">
                Pengajuan verifikasi ditolak. Anda dapat mengajukan ulang.
              </p>
            ) : null}
            {profile.verificationStatus !== "PENDING" && <VerificationForm />}
          </CardBody>
        </Card>
      )}
    </>
  );
}
