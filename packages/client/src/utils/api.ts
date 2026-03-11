const API_HOST = "localhost:3000";
const API_HOST_SECURE = false;

const getHttpProtocol = (secure: boolean) => (secure ? "https" : "http");
const getWsProtocol = (secure: boolean) => (secure ? "wss" : "ws");

const OAUTH_REDIRECT = "http://localhost:5173";
const OAUTH_START = `${getHttpProtocol(API_HOST_SECURE)}://${API_HOST}/oauth/start?receiver=session&redirect=${OAUTH_REDIRECT}`;

const API_URL = `${getHttpProtocol(API_HOST_SECURE)}://${API_HOST}/web`;
const API_WS_URL = `${getWsProtocol(API_HOST_SECURE)}://${API_HOST}/web`;

export const getOauthStart = () => OAUTH_START;

export const getApiUrl = (path: string) => `${API_URL}/${path}`;
export const getWsUrl = (path: string) => `${API_WS_URL}/${path}`;
