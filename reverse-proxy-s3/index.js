const express = require("express");
const httpproxy = require("http-proxy");

const app = express();

const PORT = 8000;
const BASE_PATH =
  "https://vercel-project-shrey.s3.ap-south-1.amazonaws.com/__outputs";

const proxy = httpproxy.createProxy();

app.use((req, res) => {
  const hostname = req.hostname;
  const subdomain = hostname.split(".")[0];
  const resolvesTo = `${BASE_PATH}/${subdomain}`;

  return proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
});

proxy.on("proxyReq", (proxyReq, req, res) => {
  const url = req.url;
  if (url === "/") proxyReq.path += "index.html";
});

app.listen(PORT, () => console.log(`reverse proxy server running on ${PORT}`));
