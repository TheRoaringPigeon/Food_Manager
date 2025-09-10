import axios from "axios";

export const getBackendBaseURL = () => {
    const domain =
        import.meta.env.VITE_BACKEND_BASE_URL ??
        `${window.location.protocol}//${window.location.host}/api`;

    return domain;
};

export const backendApiClient = (headers) => {
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const finalHeaders = {
    ...defaultHeaders,
    ...(headers || {}),
  };

  return axios.create({
    baseURL: getBackendBaseURL(),
    finalHeaders,
  });
};

