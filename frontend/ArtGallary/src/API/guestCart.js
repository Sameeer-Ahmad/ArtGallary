const STORAGE_KEY = "guestCart";

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

const write = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:updated"));
};

export const getGuestCart = () => read();

export const addToGuestCart = (artId, quantity = 1) => {
  const items = read();
  const existing = items.find((i) => i.artId === artId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ artId, quantity });
  }
  write(items);
  return items.find((i) => i.artId === artId);
};

export const updateGuestCartQuantity = (artId, quantity) => {
  const items = read();
  const existing = items.find((i) => i.artId === artId);
  if (existing) {
    existing.quantity = quantity;
    write(items);
  }
};

export const removeFromGuestCart = (artId) => {
  write(read().filter((i) => i.artId !== artId));
};

export const clearGuestCart = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const guestCartCount = () =>
  read().reduce((sum, i) => sum + i.quantity, 0);
