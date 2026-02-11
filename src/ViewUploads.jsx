import React, { useState } from "react";

export default function ViewUploads({
  uploads,
  search,
  setSearch,
  page,
  setPage,
  PER_PAGE,
  onDelete,
  deleting
}) {
  const [sortInspection, setSortInspection] = useState("none");
  const [sortDate, setSortDate] = useState("newest");
  const [modalImage, setModalImage] = useState(null);

  // -----------------------------
  // DELETE HANDLER WITH DEBUG LOGS
  // -----------------------------
  const handleDeleteUpload = async (upload) => {
    console.log("Upload object:", upload); // DEBUG

    if (
      !window.confirm(
        `Are you sure you want to delete the upload for ${upload.dorm} Room ${upload.room}?`
      )
    ) {
      return;
    }

    try {
      const userId = upload.uploadedByUserId;
      const timestamp = upload.uploadedAt;
      const imageKey = upload.imageKey;

      console.log("Extracted values:", { userId, timestamp, imageKey }); // DEBUG

      await onDelete(upload);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete upload: " + err.message);
    }
  };

  // -----------------------------
  // FILTERING
  // -----------------------------
  const filtered = uploads.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.room?.toLowerCase().includes(term) ||
      u.residentName?.toLowerCase().includes(term) ||
      u.residentEmail?.toLowerCase().includes(term) ||
      u.notes?.toLowerCase().includes(term)
    );
  });

  // -----------------------------
  // SORTING
  // -----------------------------
  let sorted = [...filtered];

  // Combined sort: inspection status (primary) + date (secondary)
  sorted.sort((a, b) => {
    // First, sort by inspection status if selected
    if (sortInspection !== "none") {
      const aMatch = a.inspectionStatus === sortInspection ? 1 : 0;
      const bMatch = b.inspectionStatus === sortInspection ? 1 : 0;
      
      // If one matches and the other doesn't, prioritize the match
      if (aMatch !== bMatch) {
        return bMatch - aMatch;
      }
      // If both match or both don't match, continue to date sort
    }

    // Then sort by date (secondary sort)
    const dateA = new Date(a.uploadedAt);
    const dateB = new Date(b.uploadedAt);
    return sortDate === "newest" ? dateB - dateA : dateA - dateB;
  });

  // -----------------------------
  // PAGINATION
  // -----------------------------
  const start = (page - 1) * PER_PAGE;
  const paginated = sorted.slice(start, start + PER_PAGE);
  const totalPages = Math.ceil(sorted.length / PER_PAGE);

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      {/* SEARCH + SORT */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px"
          }}
        />

        <select
          value={sortInspection}
          onChange={(e) => setSortInspection(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px"
          }}
        >
          <option value="none">Sort by Inspection</option>
          <option value="Passed">Passed First</option>
          <option value="Failed">Failed First</option>
          <option value="Maintenance Concern">Maintenance First</option>
        </select>

        <select
          value={sortDate}
          onChange={(e) => setSortDate(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px"
          }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* TABLE */}
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: "0 10px"
        }}
      >
        <thead>
          <tr style={{ textAlign: "left", fontWeight: 600 }}>
            <th style={{ padding: "12px" }}>Actions</th>
            <th style={{ padding: "12px" }}>RA</th>
            <th style={{ padding: "12px" }}>Dorm</th>
            <th style={{ padding: "12px" }}>Room</th>
            <th style={{ padding: "12px" }}>Resident</th>
            <th style={{ padding: "12px" }}>Inspection</th>
            <th style={{ padding: "12px" }}>Issues</th>
            <th style={{ padding: "12px" }}>Notes</th>
            <th style={{ padding: "12px" }}>Uploaded</th>
          </tr>
        </thead>

        <tbody>
          {paginated.map((u, index) => (
            <tr
              key={index}
              style={{
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
            >
              {/* ACTIONS */}
              <td style={{ padding: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    width: "120px"
                  }}
                >
                  <button
                    onClick={() => setModalImage(u.imageUrl)}
                    style={{
                      padding: "6px 10px",
                      background: "#2563eb",
                      color: "white",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 500
                    }}
                  >
                    View Image
                  </button>

                  <button
                    onClick={() => window.open(u.downloadUrl)}
                    style={{
                      padding: "6px 10px",
                      background: "#16a34a",
                      color: "white",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 500
                    }}
                  >
                    Download
                  </button>

                  <button
                    onClick={() => handleDeleteUpload(u)}
                    disabled={deleting}
                    style={{
                      padding: "6px 10px",
                      background: deleting ? "#9ca3af" : "#dc2626",
                      color: "white",
                      borderRadius: "4px",
                      border: "none",
                      cursor: deleting ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      fontWeight: 500
                    }}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </td>

              {/* RA NAME (with fallback) */}
              <td style={{ padding: "12px" }}>
                {u.uploadedByName || "Unknown"}
              </td>

              <td style={{ padding: "12px" }}>{u.dorm}</td>
              <td style={{ padding: "12px" }}>{u.room}</td>

              {/* RESIDENT */}
              <td style={{ padding: "12px" }}>
                <div style={{ fontWeight: 600 }}>{u.residentName}</div>
                <div style={{ fontSize: "12px", color: "#555" }}>
                  {u.residentEmail}
                </div>
                <div style={{ fontSize: "12px", color: "#777" }}>
                  {u.residentJNumber}
                </div>
              </td>

              {/* INSPECTION STATUS */}
              <td style={{ padding: "12px" }}>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    background:
                      u.inspectionStatus === "Passed"
                        ? "#16a34a22"
                        : u.inspectionStatus === "Failed"
                        ? "#dc262622"
                        : "#f59e0b22",
                    color:
                      u.inspectionStatus === "Passed"
                        ? "#166534"
                        : u.inspectionStatus === "Failed"
                        ? "#991b1b"
                        : "#92400e",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "inline-block"
                  }}
                >
                  {u.inspectionStatus || "Not Set"}
                </span>
              </td>

              {/* ISSUES */}
              <td style={{ padding: "12px" }}>
                {u.maintenanceIssues && u.maintenanceIssues.length > 0
                  ? u.maintenanceIssues.join(", ")
                  : "None"}
              </td>

              {/* NOTES */}
              <td style={{ padding: "12px", maxWidth: "200px" }}>
                {u.notes || "-"}
              </td>

              {/* DATE */}
              <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                {new Date(u.uploadedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* NO RESULTS MESSAGE */}
      {paginated.length === 0 && (
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "8px",
            textAlign: "center",
            color: "#666"
          }}
        >
          <p style={{ fontSize: "16px", margin: 0 }}>
            {search ? "No results found for your search." : "No uploads yet."}
          </p>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            alignItems: "center"
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
              cursor: page === 1 ? "not-allowed" : "pointer",
              fontSize: "14px"
            }}
          >
            Prev
          </button>

          <span style={{ padding: "8px 12px", fontSize: "14px" }}>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: page === totalPages ? "#eee" : "white",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              fontSize: "14px"
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* IMAGE MODAL */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 9999
          }}
        >
          <img
            src={modalImage}
            alt="Full View"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "8px",
              boxShadow: "0 0 20px rgba(0,0,0,0.5)",
              cursor: "default"
            }}
          />
          <button
            onClick={() => setModalImage(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              padding: "10px 20px",
              background: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: 600
            }}
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
}
