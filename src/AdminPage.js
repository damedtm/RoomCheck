// AdminPage.jsx

import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";

const API_URL =
  "https://s8h2e5f2j0.execute-api.us-east-2.amazonaws.com/prod/admin/fetch-uploads";

const DORMS = [
  "Alexander Hall",
  "Campbell South",
  "Campbell North",
  "Transitional Hall",
  "Dixon Hall",
  "Stewart Hall",
  "One University Place",
  "Walthall Lofts",
  "Courthouse Apartments",
];

export default function AdminPage() {
  const auth = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDorm, setSelectedDorm] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  const [selectedSection, setSelectedSection] = useState("reports");

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Fetch uploads from API
  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const resp = await fetch(API_URL);
        const data = await resp.json();

        setItems(data.items || []);
      } catch (err) {
        console.error("Error fetching uploads:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

  if (!auth.isAuthenticated) return <p>Loading...</p>;

  // SEARCH
  const searchLower = searchQuery.toLowerCase();
  const searched = items.filter((item) => {
    const fields = [
      item.uploadedByName,
      item.dorm,
      item.room,
      item.notes,
      item.residentName,
      item.residentEmail,
      item.inspectionStatus,
    ];

    return fields.some((f) => f?.toLowerCase().includes(searchLower));
  });

  // FILTER BY DORM
  const dormFiltered =
    selectedDorm === "All"
      ? searched
      : searched.filter((i) => i.dorm === selectedDorm);

  // SORT
  const sorted = [...dormFiltered].sort((a, b) => {
    const dateA = new Date(a.uploadedAt);
    const dateB = new Date(b.uploadedAt);

    switch (sortOption) {
      case "newest":
        return dateB - dateA;
      case "oldest":
        return dateA - dateB;
      case "roomAZ":
        return (a.room || "").localeCompare(b.room || "");
      case "roomZA":
        return (b.room || "").localeCompare(a.room || "");
      case "raAZ":
        return (a.uploadedByName || "").localeCompare(b.uploadedByName || "");
      case "raZA":
        return (b.uploadedByName || "").localeCompare(a.uploadedByName || "");
      default:
        return 0;
    }
  });

  // PAGINATION
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f7f7" }}>
      {/* SIDEBAR */}
      <div
        style={{
          width: "280px",
          background: "white",
          borderRight: "1px solid #ddd",
          padding: "20px",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          overflowY: "auto",
        }}
      >
        <h2>Admin Menu</h2>

        <div
          onClick={() => {
            setSelectedSection("reports");
            setSelectedDorm("All");
            setPage(1);
          }}
          style={{
            padding: "10px 0",
            cursor: "pointer",
            fontWeight: selectedSection === "reports" ? "bold" : "normal",
          }}
        >
          Dashboard (Reports)
        </div>

        <h3 style={{ marginTop: "20px" }}>Dorms</h3>

        {DORMS.map((d) => (
          <div
            key={d}
            onClick={() => {
              setSelectedDorm(d);
              setSelectedSection("reports");
              setPage(1);
            }}
            style={{
              padding: "8px 10px",
              cursor: "pointer",
              borderRadius: "6px",
              marginBottom: "4px",
              background:
                selectedDorm === d ? "rgba(0, 102, 255, 0.12)" : "transparent",
              fontWeight: selectedDorm === d ? "bold" : "normal",
            }}
          >
            {d}
          </div>
        ))}

        <button
          onClick={() => auth.removeUser()}
          style={{
            marginTop: "30px",
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #444",
            background: "white",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ marginLeft: "300px", padding: "40px", width: "100%" }}>
        <h1 style={{ textAlign: "center" }}>Admin Dashboard</h1>

        <div
          style={{
            background: "white",
            padding: "16px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          Logged in as {auth.user.profile.email}
        </div>

        {/* SEARCH + SORT */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            gap: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Search by RA, dorm, room, notes..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: "white",
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="roomAZ">Room Number (A → Z)</option>
            <option value="roomZA">Room Number (Z → A)</option>
            <option value="raAZ">RA Name (A → Z)</option>
            <option value="raZA">RA Name (Z → A)</option>
          </select>
        </div>

        {/* REPORTS LIST */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h2>
            {selectedDorm === "All"
              ? "All Uploaded Reports"
              : `${selectedDorm} Reports`}
          </h2>

          <hr style={{ margin: "20px 0" }} />

          {loading ? (
            <p>Loading reports...</p>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {paginated.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "16px",
                      background: "#fafafa",
                    }}
                  >
                    <p>
                      <strong>RA:</strong> {item.uploadedByName}
                    </p>
                    <p>
                      <strong>Dorm:</strong> {item.dorm}
                    </p>
                    <p>
                      <strong>Room:</strong> {item.room}
                    </p>
                    <p>
                      <strong>Inspection Status:</strong> {item.inspectionStatus}
                    </p>
                    <p>
                      <strong>Maintenance Issues:</strong>{" "}
                      {JSON.parse(item.maintenanceIssues).join(", ") || "None"}
                    </p>
                    <p>
                      <strong>Resident:</strong> {item.residentName} (
                      {item.residentJNumber})
                    </p>
                    <p>
                      <strong>Email:</strong> {item.residentEmail}
                    </p>
                    <p>
                      <strong>Notes:</strong> {item.notes}
                    </p>
                    <p>
                      <strong>Submitted:</strong> {formatDate(item.uploadedAt)}
                    </p>

                    {/* MULTIPLE IMAGES */}
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginTop: "10px",
                      }}
                    >
                      <a href={item.imageUrl} target="_blank" rel="noreferrer">
                        <img
                          src={item.imageUrl}
                          alt="preview"
                          style={{
                            width: "150px",
                            height: "150px",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                  gap: "10px",
                }}
              >
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    background: page === 1 ? "#eee" : "white",
                  }}
                >
                  Previous
                </button>

                <span style={{ padding: "8px 12px" }}>
                  Page {page} of {totalPages || 1}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    background: page === totalPages ? "#eee" : "white",
                  }}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
