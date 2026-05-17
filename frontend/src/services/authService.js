import http from "./http";

export const authService = {
  login: async (payload) => {
    const { data } = await http.post("/auth/login", payload);
    return data;
  },
  me: async () => {
    const { data } = await http.get("/me");
    return data;
  },
};

