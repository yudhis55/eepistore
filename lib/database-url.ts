function encodeConnectionPart(value: string) {
  return encodeURIComponent(value);
}

export function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.RDS_HOST;
  const port = process.env.RDS_PORT ?? "5432";
  const database = process.env.RDS_DATABASE;
  const username = process.env.RDS_USERNAME;
  const password = process.env.RDS_PASSWORD;

  if (!host || !database || !username || !password) {
    throw new Error(
      "DATABASE_URL is not set and RDS_HOST, RDS_DATABASE, RDS_USERNAME, or RDS_PASSWORD is missing",
    );
  }

  const schema = process.env.DATABASE_SCHEMA ?? "public";
  const sslMode = process.env.RDS_SSLMODE ?? "require";
  const params = new URLSearchParams({ schema, sslmode: sslMode });

  return `postgresql://${encodeConnectionPart(username)}:${encodeConnectionPart(password)}@${host}:${port}/${encodeConnectionPart(database)}?${params.toString()}`;
}
