// ⭐ SAFE JSON PARSE
const safeParse = (data) => {
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// ⭐ GET CURRENT USER
export const getCurrentUser = () => {
  return safeParse(localStorage.getItem("currentUser"));
};

// ⭐ GET TENANT DATA
export const getTenantData = (key) => {

  const user = getCurrentUser();

  if (!user || !user.id) return [];

  return safeParse(
    localStorage.getItem(`${key}_${user.id}`)
  ) || [];
};

// ⭐ SAVE TENANT DATA (ADD)
export const saveTenantData = (key, data) => {

  const user = getCurrentUser();
  if (!user) return;

  const existing = getTenantData(key);

  localStorage.setItem(
    `${key}_${user.id}`,
    JSON.stringify([...existing, data])
  );
};

// ⭐ UPDATE TENANT DATA
export const updateTenantData = (key, id, newData) => {

  const user = getCurrentUser();
  if (!user) return;

  const existing = getTenantData(key);

  const updated = existing.map(item =>
    item.id === id ? { ...item, ...newData } : item
  );

  localStorage.setItem(
    `${key}_${user.id}`,
    JSON.stringify(updated)
  );
};

// ⭐ DELETE TENANT DATA
export const deleteTenantData = (key, id) => {

  const user = getCurrentUser();
  if (!user) return;

  const existing = getTenantData(key);

  const filtered = existing.filter(i => i.id !== id);

  localStorage.setItem(
    `${key}_${user.id}`,
    JSON.stringify(filtered)
  );
};

// ⭐ RESET TENANT DATA (VERY IMPORTANT POS FEATURE)
export const clearTenantData = (key) => {

  const user = getCurrentUser();
  if (!user) return;

  localStorage.removeItem(`${key}_${user.id}`);
};