import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v2`;

export class ComplianceLogService {
  constructor(httpClient = axios, baseUrl = API_URL) {
    this.httpClient = httpClient;
    this.baseUrl = baseUrl;
  }

  buildParams({ page = 1, limit = 10 } = {}) {
    return { page, limit };
  }

  async fetchLogs(options = {}) {
    const params = this.buildParams(options);
    const response = await this.httpClient.get(`${this.baseUrl}/compliance/logs`, {
      params,
      headers: { "ngrok-skip-browser-warning": "true" },
      withCredentials: true,
    });
    return response.data;
  }
}

export const complianceLogService = new ComplianceLogService();
