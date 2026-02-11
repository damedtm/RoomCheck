import React, { useEffect, useState } from "react";
import {
  DynamoDBClient,
  ScanCommand
} from "@aws-sdk/client-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { useAuth } from "react-oidc-context";
import useDeleteUser from "./DeleteUser";

export default function ManageUsersTable() {
  const auth = useAuth();
  const { deleteUser } = useDeleteUser();

  const [admins, setAdmins] = useState([]);
  const [ras, setRAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("admins");

  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 5;

  const REGION = "us-east-2";
  const TABLE_NAME = "RoomCheckUsers";
  const IDENTITY_POOL_ID = "us-east-2:0d00064d-9170-417c-862e-316009584b52";

  async function getCredentials() {
    const idToken = auth.user?.id_token;
    if (!idToken) throw new Error("No ID token available");

    return fromCognitoIdentityPool({
      clientConfig: { region: REGION },
      identityPoolId: IDENTITY_POOL_ID,
      logins: {
        [`cognito-idp.${REGION}.amazonaws.com/us-east-2_lk1vd8Mwx`]: idToken
      }
    });
  }

  useEffect(() => {
    async function fetchUsers() {
      try {
        const credentials = await getCredentials();

        const client = new DynamoDBClient({
          region: REGION,
          credentials
        });

        const response = await client.send(
          new ScanCommand({ TableName: TABLE_NAME })
        );

        const items = response.Items || [];

        // ⭐ FILTER OUT NON-USER ITEMS
        const userItems = items.filter(item =>
          item.userId &&
          item.email &&
          item.firstName &&
          item.lastName &&
          item.role
        );

        const formatted = userItems.map((item) => ({
          userId: item.userId.S,
          createdAt: item.createdAt?.S || "",
          email: item.email.S,
          firstName: item.firstName.S,
          lastName: item.lastName.S,
          role: item.role.S,
          dorm: item.dorm?.S || ""
        }));

        setAdmins(formatted.filter((u) => u.role.toLowerCase().includes("admin")));
        setRAs(formatted.filter((u) => u.role.toLowerCase().includes("ra")));
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    }

    if (auth.isAuthenticated) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [auth.isAuthenticated]);

  function paginate(list) {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return list.slice(start, start + USERS_PER_PAGE);
  }

  async function handleDelete(userId, email) {
    const confirmed = window.confirm(`Delete user ${email}?`);
    if (!confirmed) return;

    const result = await deleteUser(userId, email);

    if (result.success) {
      alert("User deleted");
      setTimeout(() => window.location.reload(), 300);
    } else {
      alert("Error deleting user: " + result.error);
    }
  }

  function handleEdit(user) {
    alert("Edit user feature coming next");
  }

  if (loading) {
    return <p>Loading users…</p>;
  }

  const buttonStyle = {
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid #ccc",
    background: "#f7f7f7",
    cursor: "pointer"
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
      <h2>Manage Users</h2>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => {
            setView("admins");
            setCurrentPage(1);
          }}
          style={view === "admins" ? primaryButtonStyle : buttonStyle}
        >
          View Admins
        </button>

        <button
          onClick={() => {
            setView("ras");
            setCurrentPage(1);
          }}
          style={{ marginLeft: 10, ...(view === "ras" ? primaryButtonStyle : buttonStyle) }}
        >
          View RAs
        </button>
      </div>

      <h3>{view === "admins" ? "Admins" : "Resident Assistants"}</h3>

      {list.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 8px"
            }}
          >
            <thead>
              <tr>
                <th style={tableCellStyle}>First Name</th>
                <th style={tableCellStyle}>Last Name</th>
                <th style={tableCellStyle}>Email</th>
                {view === "ras" && <th style={tableCellStyle}>Dorm</th>}
                <th style={tableCellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginate(list).map((u, index) => (
                <tr key={index} style={tableRowStyle}>
                  <td style={tableCellStyle}>{u.firstName}</td>
                  <td style={tableCellStyle}>{u.lastName}</td>
                  <td style={tableCellStyle}>{u.email}</td>
                  {view === "ras" && <td style={tableCellStyle}>{u.dorm}</td>}
                  <td style={tableCellStyle}>
                    <button
                      onClick={() => handleEdit(u)}
                      style={{ ...buttonStyle, marginRight: 10 }}
                    >
                      Edit information
                    </button>
                    <button
                      onClick={() => handleDelete(u.userId, u.email)}
                      style={dangerButtonStyle}
                    >
                      Delete this user
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 15 }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={{ ...buttonStyle, marginRight: 10 }}
            >
              Previous
            </button>

            <button
              disabled={currentPage * USERS_PER_PAGE >= list.length}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={buttonStyle}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
