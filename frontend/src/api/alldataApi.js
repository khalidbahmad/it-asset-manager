import client from "./axiosClient";

export const getAllData = () => {
    return client.get('/all-data').then(r => r.data);
};

// ── Categories ────────────────────────────────────────────────────────
export const addCategory    = (name) => client.post('/categories', { name });
export const deleteCategory = (id)   => client.delete(`/categories/${id}`);

// ── Brands ────────────────────────────────────────────────────────────
export const addBrand    = (name) => client.post('/brands', { name });
export const deleteBrand = (id)   => client.delete(`/brands/${id}`);

// ── Locations ─────────────────────────────────────────────────────────
export const addLocation    = (name) => client.post('/locations', { name });
export const deleteLocation = (id)   => client.delete(`/locations/${id}`);

// ── Agences ─────────────────────────────────────────────────────────
export const addAgence    = (name) => client.post('/agences', { name });
export const deleteAgence = (id)   => client.delete(`/agences/${id}`);