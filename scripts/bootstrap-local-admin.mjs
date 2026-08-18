import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminEmail = "admin@local.test";
const adminPassword = "AdminLocal!12345";

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para o bootstrap local.",
  );
  process.exit(1);
}

const url = new URL(supabaseUrl);
const isLocal =
  url.hostname === "localhost" ||
  url.hostname === "127.0.0.1" ||
  url.hostname === "::1";

if (!isLocal) {
  console.error("Bootstrap abortado: SUPABASE_URL não aponta para localhost.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function ensureUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      full_name: "Admin Local",
    },
  });

  if (!error && data.user) {
    return data.user;
  }

  const { data: usersData, error: usersError } =
    await supabase.auth.admin.listUsers();

  if (usersError) {
    throw usersError;
  }

  const existing = usersData.users.find((user) => user.email === adminEmail);

  if (!existing) {
    throw error ?? new Error("Não foi possível criar usuário local.");
  }

  return existing;
}

async function main() {
  const user = await ensureUser();

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: "Admin Local",
  });

  if (profileError) throw profileError;

  const { data: tenantA, error: tenantAError } = await supabase
    .from("tenants")
    .upsert(
      {
        name: "Tenant Demo A",
        slug: "tenant-demo-a",
        type: "hospitality",
        status: "active",
        published_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (tenantAError) throw tenantAError;

  const { error: tenantBError } = await supabase.from("tenants").upsert(
    {
      name: "Tenant Demo B",
      slug: "tenant-demo-b",
      type: "hospitality",
      status: "active",
      published_at: new Date().toISOString(),
    },
    { onConflict: "slug" },
  );

  if (tenantBError) throw tenantBError;

  const { error: membershipError } = await supabase
    .from("tenant_members")
    .upsert(
      {
        tenant_id: tenantA.id,
        user_id: user.id,
        role: "tenant_admin",
        status: "active",
      },
      { onConflict: "tenant_id,user_id" },
    );

  if (membershipError) throw membershipError;

  console.log("Bootstrap local concluído.");
  console.log(`E-mail: ${adminEmail}`);
  console.log(`Senha: ${adminPassword}`);
  console.log("Tenant autorizado: tenant-demo-a");
  console.log("Tenant sem acesso para teste: tenant-demo-b");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
