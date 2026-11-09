const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest(path, { method = "GET", body, token, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(" ")
      : detail || "The request could not be completed.";
    throw new ApiError(message, response.status);
  }
  return data;
}

export function saveSession(session) {
  localStorage.setItem("agri_session", JSON.stringify(session));
}

export function readSession() {
  try {
    return JSON.parse(localStorage.getItem("agri_session") || "null");
  } catch {
    localStorage.removeItem("agri_session");
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("agri_session");
}

export function readCart() {
  try {
    return JSON.parse(localStorage.getItem("agri_cart") || "[]");
  } catch {
    localStorage.removeItem("agri_cart");
    return [];
  }
}

export function saveCart(items) {
  localStorage.setItem("agri_cart", JSON.stringify(items));
  window.dispatchEvent(new Event("agri_cart_updated"));
}

export function addToCart(product, quantity = 1) {
  const currentCart = readCart();
  const existingIndex = currentCart.findIndex((item) => item.id === product.id);
  if (existingIndex > -1) {
    currentCart[existingIndex].quantity += quantity;
  } else {
    currentCart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit || "kg",
      farm: product.farm || product.farm_name,
      quantity,
    });
  }
  saveCart(currentCart);
}

export function removeFromCart(productId) {
  const currentCart = readCart().filter((item) => item.id !== productId);
  saveCart(currentCart);
}

export function updateCartQuantity(productId, quantity) {
  let currentCart = readCart();
  if (quantity <= 0) {
    currentCart = currentCart.filter((item) => item.id !== productId);
  } else {
    currentCart = currentCart.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
  }
  saveCart(currentCart);
}

export function clearCart() {
  localStorage.removeItem("agri_cart");
  window.dispatchEvent(new Event("agri_cart_updated"));
}

