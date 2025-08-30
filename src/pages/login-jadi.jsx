import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setWarning("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // ganti pesan default Supabase
      if (error.message === "Invalid login credentials") {
        setWarning("Email atau password salah");
      } else {
        setWarning(error.message);
      }
    } else {
      // login sukses → redirect ke dashboard
      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {warning && (
          <div style={{ color: "red", marginTop: "1rem" }}>{warning}</div>
        )}

        <button type="submit" disabled={loading} style={{ marginTop: "1rem" }}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
}
