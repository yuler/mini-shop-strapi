const strapi = require("@strapi/strapi");
const app = strapi({ distDir: "./build" });
app.start();
