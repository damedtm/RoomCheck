// api.js

const API_BASE = "https://lsnro81xgl.execute-api.us-east-2.amazonaws.com/prod";

export async function getUploads(idToken) {
  const res = await fetch(`${API_BASE}/admin/get-uploads`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  if (!res.ok) throw new Error("Failed to fetch uploads");
  const data = await res.json();
  return data.items || [];
}

export async function createUser(formData) {
  const res = await fetch(`${API_BASE}/create-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData)
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || "Failed to create user");
  }
  return res.json();
}

export async function deleteUpload(userId, timestamp, imageKey, idToken) {
  const res = await fetch(`${API_BASE}/admin/delete-upload`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify({ 
      userId, 
      timestamp, 
      imageKey 
    })
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || "Failed to delete upload");
  }
  
  return res.json();
}