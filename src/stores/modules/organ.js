import { defineStore } from "pinia";

const useOrganStore = defineStore("organ", {
  state: () => ({
    depts: [],
    roles: [],
    users: [],
  }),
  getters: {
    getUserById: (state) => {
      return (userId) => state.users.find((user) => user.id === userId) || { id: userId, name: "" };
    },
    getDeptById: (state) => {
      return (deptId) => state.depts.find((dept) => dept.id === deptId) || { id: deptId, name: "" };
    },
    getRoleById: (state) => {
      return (roleId) => state.roles.find((role) => role.id === roleId) || { id: userId, name: "" };
    },
    getById: (state) => {
      return (id) => {
        let item = null;
        item = state.depts.find((dept) => dept.id === id);
        if (item == null) item = state.roles.find((role) => role.id === id);
        if (item == null) item = state.users.find((user) => user.id === id);
        return item || { id: id, name: "未知" };
      };
    },
  },
  actions: {
    setDepts(depts) {
      this.depts = depts || [];
    },
    setRoles(roles) {
      this.roles = roles || [];
    },
    setUsers(users) {
      this.users = users || [];
    },
    getDepts() {
      return JSON.parse(JSON.stringify(this.depts));
    },
    getRoles() {
      return JSON.parse(JSON.stringify(this.roles));
    },
    getUsers() {
      return JSON.parse(JSON.stringify(this.users));
    },
  },
});

export default useOrganStore;
