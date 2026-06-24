import { getMyProfile, getMyAddresses } from "@/features/profile/actions";
import { ProfileForm } from "@/components/profile-form";
import { AddressManager } from "@/components/address-manager";
import { VerificationForm } from "@/components/verification-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil — EEPISTORE",
};

export default async function ProfilePage() {
  const [profile, addresses] = await Promise.all([getMyProfile(), getMyAddresses()]);

  if (!profile) {
    return (
      <main className="container mx-auto px-4 py-8">
        <p className="text-neutral-500">Profil tidak ditemukan.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">Profil Saya</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile info */}
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-4 text-sm font-semibold">Informasi Akun</h2>
          <ProfileForm profile={profile} />
        </div>

        {/* Addresses */}
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-4 text-sm font-semibold">Alamat</h2>
          <AddressManager addresses={addresses} />
        </div>
      </div>

      {/* Account info */}
      <div className="mt-6 rounded-lg border border-border p-4">
        <h2 className="mb-3 text-sm font-semibold">Detail Akun</h2>
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
            <p className="font-medium">{profile.nim ?? "-"}</p>
          </div>
          <div>
            <span className="text-neutral-500">Verified Student</span>
            <p className="font-medium">{profile.isVerifiedStudent ? "Ya" : "Belum"}</p>
          </div>
          <div>
            <span className="text-neutral-500">Bergabung</span>
            <p className="font-medium">{new Date(profile.createdAt).toLocaleDateString("id-ID")}</p>
          </div>
        </div>
      </div>

      {/* Student verification */}
      {!profile.isVerifiedStudent && (
        <div className="mt-6 rounded-lg border border-brand-gold-500/30 bg-brand-gold-500/5 p-4">
          <h2 className="mb-2 text-sm font-semibold text-brand-navy-900">Verified Student Badge</h2>
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
        </div>
      )}
    </main>
  );
}
