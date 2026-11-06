const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/+$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const responseText = await response.text();
  let body = null;
  if (responseText) {
    try {
      body = JSON.parse(responseText);
    } catch {
      if (response.ok) {
        throw new Error("The server returned an invalid JSON response.");
      }
    }
  }
  if (!response.ok) {
    const detail = body?.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(", ")
      : detail || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body;
}

export function getProducts({ search = "", category = "", signal } = {}) {
  const query = new URLSearchParams();
  if (search.trim()) query.set("search", search.trim());
  if (category && category !== "All") query.set("category", category);
  const suffix = query.size ? `?${query}` : "";
  return request(`/api/marketplace/products${suffix}`, { signal });
}

export function createOrder(order) {
  return request("/api/marketplace/orders", {
    method: "POST",
    body: JSON.stringify(order),
  });
}

export function getOrders(phone) {
  const query = new URLSearchParams({ phone });
  return request(`/api/marketplace/orders?${query}`);
}
