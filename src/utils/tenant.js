<<<<<<< HEAD
export const getCurrentUser = () =>
  JSON.parse(localStorage.getItem("currentUser"));

export const getTenantData = (key) => {

  const user = getCurrentUser();
  if (!user) return [];

  return JSON.parse(
    localStorage.getItem(`${key}_${user.id}`)
  ) || [];
};

export const saveTenantData = (key, data) => {

  const user = getCurrentUser();
  if (!user) return;

  const existing =
    JSON.parse(localStorage.getItem(`${key}_${user.id}`)) || [];

  localStorage.setItem(
    `${key}_${user.id}`,
    JSON.stringify([...existing, data])
  );
=======
export const getCurrentUser = () =>
  JSON.parse(localStorage.getItem("currentUser"));

export const getTenantData = (key) => {

  const user = getCurrentUser();
  if (!user) return [];

  return JSON.parse(
    localStorage.getItem(`${key}_${user.id}`)
  ) || [];
};

export const saveTenantData = (key, data) => {

  const user = getCurrentUser();
  if (!user) return;

  const existing =
    JSON.parse(localStorage.getItem(`${key}_${user.id}`)) || [];

  localStorage.setItem(
    `${key}_${user.id}`,
    JSON.stringify([...existing, data])
  );
>>>>>>> 479c1c5f3a0fe0426cba61fe2c2eecef4c23e0a9
};