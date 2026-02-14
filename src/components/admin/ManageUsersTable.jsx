// ManageUsersTable.jsx - DIAGNOSTIC VERSION
// Adds detailed console logging to help identify the issue

import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getUsers, deleteUser } from "../../utils/api";

export default function ManageUsersTable() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("admins");
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 5;

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🔍 Fetching users...");
        console.log("Auth status:", { isAuthenticated, hasUser: !!user, hasToken: !!user?.id_token });
        
        const fetchedUsers = await getUsers(user.id_token);
        
        console.log("✅ Users fetched successfully:", fetchedUsers);
        console.log("📊 User count:", fetchedUsers.length);
        console.log("📋 First user sample:", fetchedUsers[0]);
        
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("❌ Error fetching users:", err);
        console.error("Error details:", {
          message: err.message,
          stack: err.stack,
          response: err.response
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated && user) {
      fetchUsers();
    } else {
      console.log("⚠️ Not authenticated or no user");
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  function paginate(list) {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return list.slice(start, start + USERS_PER_PAGE);
  }

  async function handleDelete(username, email) {
    const confirmed = window.confirm(
      `Are you sure you want to delete user ${email}?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    
    try {
      await deleteUser(username, user.id_token);
      
      // Remove from local state
      setUsers(prev => prev.filter(u => u.username !== username));
      
      alert("✓ User deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      alert(`✗ Failed to delete user\n\n${err.message}`);
    } finally {
      setDeleting(false);
    }
  }

  function handleEdit(user) {
    alert("Edit user feature coming soon");
  }

  if (authLoading || loading) {
    return (
      <div style={{ 
        background: "white", 
        padding: 60, 
        borderRadius: 8,
        textAlign: "center"
      }}>
        <div style={{
          width: "50px",
          height: "50px",
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #3498db",
          borderRadius: "50%",
          margin: "0 auto 20px auto",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{ color: "#666" }}>Loading users...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: "#fee",
        border: "2px solid #fcc",
        padding: 30,
        borderRadius: 8,
        textAlign: "center"
      }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>✗</div>
        <h3 style={{ color: "#c00", marginBottom: 10 }}>Failed to Load Users</h3>
        <p style={{ color: "#666", marginBottom: 20 }}>{error}</p>
        <div style={{ 
          background: "#fff", 
          padding: "15px", 
          borderRadius: "6px", 
          marginBottom: "20px",
          textAlign: "left",
          fontSize: "12px",
          fontFamily: "monospace"
        }}>
          <strong>Debug Info:</strong><br/>
          Check browser console (F12) for detailed error logs
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            background: "#3498db",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  console.log("📊 Current state:", {
    totalUsers: users.length,
    view,
    currentPage
  });

  const admins = users.filter((u) => u.role?.toLowerCase().includes("admin"));
  const ras = users.filter((u) => u.role?.toLowerCase().includes("ra"));

  console.log("👥 Filtered users:", {
    admins: admins.length,
    ras: ras.length
  });

  const buttonStyle = {
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid #ccc",
    background: "#f7f7f7",
    cursor: "pointer",
    fontSize: "14px"
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    background: "#ffdddd",
    border: "1px solid #ffaaaa",
    color: "#b30000"
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: "#007bff",
    color: "white",
    border: "1px solid #006ae0"
  };

  const tableRowStyle = {
    background: "white",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  };

  const tableCellStyle = {
    padding: "12px 16px"
  };

  const list = view === "admins" ? admins : ras;

  return (
    <div style={{ background: "white", padding: 20, borderRadius: 8 }}>
      <h2 style={{ marginBottom: 20 }}>Manage Users</h2>

      {/* Debug Panel */}
      <div style={{
        background: "#f0f8ff",
        border: "1px solid #b3d9ff",
        padding: "15px",
        borderRadius: "6px",
        marginBottom: "20px",
        fontSize: "13px"
      }}>
        <strong>🔍 Debug Info:</strong><br/>
        Total Users: {users.length} | Admins: {admins.length} | RAs: {ras.length}<br/>
        Current View: {view} | Showing: {list.length} users<br/>
        Open browser console (F12) for detailed logs
      </div>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => {
            setView("admins");
            setCurrentPage(1);
          }}
          style={view === "admins" ? primaryButtonStyle : buttonStyle}
        >
          View Admins ({admins.length})
        </button>

        <button
          onClick={() => {
            setView("ras");
            setCurrentPage(1);
          }}
          style={{ 
            marginLeft: 10, 
            ...(view === "ras" ? primaryButtonStyle : buttonStyle) 
          }}
        >
          View RAs ({ras.length})
        </button>
      </div>

      <h3 style={{ marginBottom: 15 }}>
        {view === "admins" ? "Administrators" : "Resident Assistants"}
      </h3>

      {list.length === 0 ? (
        <div style={{ 
          background: "#fff3cd", 
          border: "1px solid #ffc107",
          padding: "20px", 
          borderRadius: "6px",
          textAlign: "center"
        }}>
          <p style={{ color: "#856404", margin: 0 }}>
            No {view === "admins" ? "administrators" : "RAs"} found.
          </p>
          <p style={{ color: "#856404", fontSize: "12px", marginTop: "10px" }}>
            This could mean:<br/>
            • The API returned {users.length} total users<br/>
            • None have role matching "{view === "admins" ? "admin" : "ra"}"<br/>
            • Check the browser console for the actual user data
          </p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0 8px",
                minWidth: "600px"
              }}
            >
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={tableCellStyle}>Email</th>
                  {view === "ras" && <th style={tableCellStyle}>Dorm</th>}
                  <th style={tableCellStyle}>Role</th>
                  <th style={tableCellStyle}>Status</th>
                  <th style={tableCellStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginate(list).map((u, index) => (
                  <tr key={u.username || u.userId || index} style={tableRowStyle}>
                    <td style={tableCellStyle}>{u.email || u.username}</td>
                    {view === "ras" && (
                      <td style={tableCellStyle}>{u.dorm || "-"}</td>
                    )}
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        background: u.role?.toLowerCase().includes("admin") ? "#e3f2fd" : "#fff3e0",
                        fontSize: 12,
                        fontWeight: 500
                      }}>
                        {u.role || "Unknown"}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        background: u.enabled ? "#e8f5e9" : "#ffebee",
                        color: u.enabled ? "#2e7d32" : "#c62828",
                        fontSize: 12,
                        fontWeight: 500
                      }}>
                        {u.enabled !== undefined ? (u.enabled ? "Active" : "Disabled") : "Unknown"}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ 
                        display: "flex", 
                        gap: 10,
                        flexWrap: "wrap"
                      }}>
                        <button
                          onClick={() => handleEdit(u)}
                          style={buttonStyle}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u.username || u.userId, u.email)}
                          disabled={deleting}
                          style={{
                            ...dangerButtonStyle,
                            opacity: deleting ? 0.6 : 1,
                            cursor: deleting ? "not-allowed" : "pointer"
                          }}
                        >
                          {deleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {list.length > USERS_PER_PAGE && (
            <div style={{ 
              marginTop: 20, 
              display: "flex", 
              justifyContent: "center",
              alignItems: "center",
              gap: 10
            }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                style={{
                  ...buttonStyle,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer"
                }}
              >
                Previous
              </button>

              <span style={{ fontSize: 14, color: "#666" }}>
                Page {currentPage} of {Math.ceil(list.length / USERS_PER_PAGE)}
              </span>

              <button
                disabled={currentPage * USERS_PER_PAGE >= list.length}
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{
                  ...buttonStyle,
                  opacity: currentPage * USERS_PER_PAGE >= list.length ? 0.5 : 1,
                  cursor: currentPage * USERS_PER_PAGE >= list.length ? "not-allowed" : "pointer"
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
