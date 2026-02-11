import { useAuth } from "react-oidc-context";

export default function Login() {
  const auth = useAuth();

  if (auth.isLoading) return <p>Loading...</p>;
  if (auth.error) return <p>Error: {auth.error.message}</p>;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "url('/jsu-campus.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "Inter, sans-serif"
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.6)",
          padding: "40px",
          borderRadius: "12px",
          width: "350px",
          textAlign: "center",
          color: "white",
          backdropFilter: "blur(6px)"
        }}
      >
        <h1 style={{ marginBottom: "10px", fontSize: "28px" }}>
          RoomCheck
        </h1>
        <p style={{ marginBottom: "30px", color: "#ccc" }}>
          Sign in to continue
        </p>

        <button
          onClick={() => auth.signinRedirect()}
          style={{
            width: "100%",
            padding: "12px",
            background: "#2563eb",
            border: "none",
            borderRadius: "8px",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
