import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  return Object.fromEntries(
    fs.readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "")];
      }),
  );
}

const env = loadEnv();
const expectedUrl = "https://kqtmwmgtyqkxsbtohjjm.supabase.co";
if (env.NEXT_PUBLIC_SUPABASE_URL !== expectedUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL não aponta para o projeto remoto esperado.");
}
if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
}

const tenantId = "866c6b1e-2e42-4fe0-b1c1-64fb27ffa0d9";
const objectUrl = "https://pub-72389248f1cd44c585ec796a1b155194.r2.dev/Chal%C3%A9s%20Caravaggio-720p-compatible.mp4";
const filename = "Chalés Caravaggio-720p-compatible.mp4";
const supabase = createClient(expectedUrl, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existing, error: existingError } = await supabase
  .from("media")
  .select("id, original_filename, storage_path")
  .eq("tenant_id", tenantId)
  .eq("storage_bucket", "external-r2")
  .eq("original_filename", filename)
  .maybeSingle();
if (existingError) throw existingError;

if (existing) {
  if (existing.storage_path !== objectUrl) {
    const { error: updateError } = await supabase
      .from("media")
      .update({ storage_path: objectUrl, status: "published" })
      .eq("tenant_id", tenantId)
      .eq("id", existing.id);
    if (updateError) throw updateError;
    console.log(`URL pública do vídeo R2 atualizada: ${existing.original_filename} (${existing.id})`);
  } else {
    console.log(`Vídeo R2 já estava cadastrado: ${existing.original_filename} (${existing.id})`);
  }
  process.exit(0);
}

const { data, error } = await supabase
  .from("media")
  .insert({
    tenant_id: tenantId,
    media_type: "video",
    storage_bucket: "external-r2",
    storage_path: objectUrl,
    original_filename: filename,
    mime_type: "video/mp4",
    size_bytes: null,
    caption: "Vídeo informativo",
    alt_text: "Vídeo informativo da Villa Caravaggio",
    status: "published",
  })
  .select("id, original_filename")
  .single();
if (error) throw error;

console.log(`Vídeo R2 cadastrado e publicado no card global de Vídeos: ${data.original_filename} (${data.id})`);
