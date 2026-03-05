export const env = {
  GITHUB_CLIENT_ID: process.env["GITHUB_CLIENT_ID"]! as string,
  GITHUB_CLIENT_SECRET: process.env["GITHUB_CLIENT_SECRET"]! as string,

  JWT_SECRET: process.env["JWT_SECRET"]! as string,
};
