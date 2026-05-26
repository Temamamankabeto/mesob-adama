// Merge these methods into applicationWorkflowService if you want custom manager UI.
export const managerWorkflowEndpoints = {
  queue: '/manager/applications/queue',
  show: (id: number) => `/manager/applications/${id}`,
  assignOfficer: (id: number) => `/manager/applications/${id}/assign-officer`,
  returnToOfficer: (id: number) => `/manager/applications/${id}/return-to-officer`,
  escalateUp: (id: number) => `/manager/applications/${id}/escalate-up`,
};
export const applicationWorkflowService = {
 

  officer: {
    certificateUrl(id: number) {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "/api";

      return `${baseUrl}/officer/applications/${id}/certificate`;
    },

    async queue() {
      return [];
    },

    async show(id: number) {
      return null;
    },

    async action() {
      return null;
    },

    async backOfficerAction() {
      return null;
    },

    async frontOfficers() {
      return [];
    },
  },

  manager: {
    async queue() {
      return [];
    },

    async show() {
      return null;
    },

    async action() {
      return null;
    },
  },

  applications: {
    async list() {
      return [];
    },

    async show() {
      return null;
    },
  },

  dashboard: {
    async summary() {
      return {};
    },
  },

  forms: {},
  steps: {},
  sections: {},
  fields: {},
  conditions: {},
  builder: {},
  serviceApplications: {},
};