import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import dns from "dns/promises";

export async function POST(req) {
  try {
    const body = await req.json();
    const { nama, email, password, jabatan, role } = body;

    // 1. Validasi semua field
    if (!nama || !email || !password || !jabatan || !role) {
      return new Response(JSON.stringify({ error: "Semua field harus diisi." }), { status: 400 });
    }

    // 2. Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Format email tidak valid." }), { status: 400 });
    }

    // 3. Validasi domain email (MX record)
    try {
      const domain = email.split("@")[1];
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return new Response(JSON.stringify({ error: "Domain email tidak valid." }), { status: 400 });
      }
    } catch {
      return new Response(JSON.stringify({ error: "Domain email tidak valid." }), { status: 400 });
    }

    // 4. Validasi password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return new Response(JSON.stringify({ error: "Password minimal 8 karakter dan terdiri dari huruf dan angka." }), { status: 400 });
    }

    // 5. Cek email sudah ada di profiles
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (existingProfile) {
      return new Response(JSON.stringify({ error: "Email sudah terdaftar." }), { status: 400 });
    }

    // 6. Cek jabatan sudah ada di profiles
    const { data: existingJabatan } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("jabatan", jabatan)
      .maybeSingle();
    if (existingJabatan) {
      return new Response(JSON.stringify({ error: `Jabatan ${jabatan} sudah terdaftar.` }), { status: 400 });
    }

    // 7. Buat user di Supabase Auth
    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });
    if (authError) {
      if (authError.message.includes("already registered")) {
        return new Response(JSON.stringify({ error: "Email sudah terdaftar." }), { status: 400 });
      }
      throw authError;
    }

    const userId = userData.user.id;

    // 8. Insert ke tabel profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([{
        user_id: userId,
        nama,
        email,
        jabatan,
        role,
        created_at: new Date().toISOString(),
      }]);

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId); // rollback
      // Tangani unique constraint jabatan
      if (profileError.code === "23505") {
        return new Response(JSON.stringify({ error: `Jabatan ${jabatan} sudah terdaftar.` }), { status: 400 });
      }
      throw profileError;
    }

    // 9. Kirim email undangan
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: "https://crtyokef2025absensi-pemdes-oelneke.vercel.app/p",
    });
    if (inviteError) throw inviteError;

    return new Response(JSON.stringify({ message: "Pengguna berhasil ditambahkan. Silakan cek email untuk konfirmasi." }), { status: 200 });

  } catch (err) {
    console.error("❌ Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Terjadi kesalahan server" }), { status: 500 });
  }
}

// GET endpoint untuk cek jabatan unik (frontend realtime)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const jabatan = searchParams.get("jabatan");
  if (!jabatan) return new Response(JSON.stringify({ exists: false }), { status: 200 });

  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("jabatan", jabatan)
    .maybeSingle();

  return new Response(JSON.stringify({ exists: !!data }), { status: 200 });
}
