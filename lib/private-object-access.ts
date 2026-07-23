import type { Role } from "@/lib/rbac";

const PRIVATE_FOLDERS = new Set(["payments", "verifications"]);

export type PrivateObjectFolder = "payments" | "verifications";

export type ParsedPrivateObjectKey = {
  key: string;
  folder: PrivateObjectFolder;
  ownerId: string;
};

export type PrivateObjectSessionUser = {
  id: string;
  role: Role;
};

export type PaymentObjectAccess = {
  buyerId: string;
  sellerUserId: string;
};

export type VerificationObjectAccess = {
  userId: string;
};

export type PrivateObjectLookup = {
  findPaymentAccessByKey: (key: string) => Promise<PaymentObjectAccess | null>;
  findVerificationAccessByKey: (
    key: string,
    ownerId: string,
  ) => Promise<VerificationObjectAccess | null>;
};

export function parsePrivateObjectKey(key: string): ParsedPrivateObjectKey | null {
  if (!key || key.startsWith("/") || key.includes("\\") || key.includes("..")) {
    return null;
  }

  const parts = key.split("/");
  const [folder, ownerId] = parts;

  if (!folder || !ownerId || !PRIVATE_FOLDERS.has(folder) || parts.length < 3) {
    return null;
  }

  if (parts.some((part) => part.trim() === "")) {
    return null;
  }

  return {
    key,
    folder: folder as PrivateObjectFolder,
    ownerId,
  };
}

export function objectUrlMatchesKey(url: string | null | undefined, key: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.pathname === "/api/uploads/private" && parsed.searchParams.get("key") === key;
  } catch {
    return url === key;
  }
}

export function parsePrivateObjectUrl(url: string): ParsedPrivateObjectKey | null {
  try {
    const parsed = new URL(url);
    if (parsed.pathname !== "/api/uploads/private") return null;
    return parsePrivateObjectKey(parsed.searchParams.get("key") ?? "");
  } catch {
    return parsePrivateObjectKey(url);
  }
}

export async function canReadPrivateObject(
  user: PrivateObjectSessionUser,
  object: ParsedPrivateObjectKey,
  lookup: PrivateObjectLookup,
): Promise<boolean> {
  if (object.folder === "payments") {
    const access = await lookup.findPaymentAccessByKey(object.key);
    if (!access) return false;

    return user.role === "ADMIN" || user.id === access.buyerId || user.id === access.sellerUserId;
  }

  const access = await lookup.findVerificationAccessByKey(object.key, object.ownerId);
  if (!access) return false;

  return user.role === "ADMIN" || user.id === access.userId;
}
