import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email wajib diisi" }), { status: 400 });
    }

    // Ambil daftar user dari Supabase Admin
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 0, per_page: 100 });
    if (error) {
      console.error("Supabase Admin error:", error);
      throw new Error("Gagal mengambil data user");
    }

    // data.users adalah array yang sebenarnya
    const exists = data.users.some(user => user.email === email);

    return new Response(JSON.stringify({ exists }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || "Terjadi kesalahan server" }), { status: 500 });
  }
}
