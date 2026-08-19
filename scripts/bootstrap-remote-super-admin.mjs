import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const envLocalPath = path.join(projectRoot, ".env.local");
const expectedSupabaseUrl = "https://kqtmwmgtyqkxsbtohjjm.supabase.co";

loadEnvFile(envLocalPath);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const superAdminEmail = normalizeRequiredEnv("SUPER_ADMIN_EMAIL");
const superAdminPassword = normalizeRequiredEnv("SUPER_ADMIN_PASSWORD");
const superAdminName = normalizeRequiredEnv("SUPER_ADMIN_NAME");

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local para o bootstrap remoto.",
  );
  process.exit(1);
}

if (supabaseUrl !== expectedSupabaseUrl) {
  console.error(
    `Bootstrap abortado: NEXT_PUBLIC_SUPABASE_URL deve apontar exatamente para ${expectedSupabaseUrl}.`,
  );
  process.exit(1);
}

const url = new URL(supabaseUrl);
const isLocal =
  url.hostname === "localhost" ||
  url.hostname === "127.0.0.1" ||
  url.hostname === "::1";

if (isLocal) {
  console.error("Bootstrap abortado: o script remoto nao pode apontar para localhost.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, "utf8");
  const lines = contents.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function normalizeRequiredEnv(key) {
  const value = process.env[key];

  if (!value || !value.trim()) {
    console.error(`Configure a variavel de ambiente ${key} antes de executar o bootstrap.`);
    process.exit(1);
  }

  return value.trim();
}

async function findUserByEmail(email) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const existingUser = data.users.find((user) => user.email === email);

    if (existingUser) {
      return existingUser;
    }

    if (data.users.length < 200) {
      return null;
    }

    page += 1;
  }
}

async function ensureUser() {
  const existingUser = await findUserByEmail(superAdminEmail);

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      email_confirm: true,
      user_metadata: {
        full_name: superAdminName,
      },
    });

    if (error) {
      throw error;
    }

    return {
      user: data.user,
      status: "reutilizado",
    };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: superAdminEmail,
    password: superAdminPassword,
    email_confirm: true,
    user_metadata: {
      full_name: superAdminName,
    },
  });

  if (error || !data.user) {
    throw error ?? new Error("Nao foi possivel criar o primeiro Super Admin.");
  }

  return {
    user: data.user,
    status: "criado",
  };
}

async function upsertProfile(userId) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      full_name: superAdminName,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }
}

async function upsertSuperAdmin(userId) {
  const { error } = await supabase.from("super_admins").upsert(
    {
      user_id: userId,
      is_active: true,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw error;
  }
}

async function main() {
  const result = await ensureUser();

  await upsertProfile(result.user.id);
  await upsertSuperAdmin(result.user.id);

  console.log(`Usuario ${result.status}: ${superAdminEmail}`);
  console.log("Profile criado/atualizado.");
  console.log("Super Admin ativado.");
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
