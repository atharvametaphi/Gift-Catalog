import http from "./http";

export const userService = {
  getUsers: async () => {
    const { data } = await http.get("/users");
    return data;
  },
  createUser: async (payload) => {
    const { data } = await http.post("/users", payload);
    return data;
  },
  updateUser: async (userId, payload) => {
    const { data } = await http.put(`/users/${userId}`, payload);
    return data;
  },
  deleteUser: async (userId) => {
    const { data } = await http.delete(`/users/${userId}`);
    return data;
  },
  updateUserRole: async (userId, role) => {
    const { data } = await http.put(`/users/${userId}/role`, { role });
    return data;
  },
};
