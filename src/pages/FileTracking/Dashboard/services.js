import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api/v2`;

export class FileTrackDashboardService {
  constructor(httpClient = axios, baseUrl = API_URL) {
    this.httpClient = httpClient;
    this.baseUrl = baseUrl;
  }

  buildParams({ page = 1, limit = 5, startDate, endDate } = {}) {
    const params = { page, limit };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }

  async fetchRecentTracks(options = {}) {
    const params = this.buildParams(options);

    const response = await this.httpClient.get(
      `${this.baseUrl}/filetrack/paginatedtracks`,
      {
        params,
        headers: { "ngrok-skip-browser-warning": "true" },
        withCredentials: true,
      }
    );

    return response.data;
  }
}

export const fileTrackDashboardService = new FileTrackDashboardService();
