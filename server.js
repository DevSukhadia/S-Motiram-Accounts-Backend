const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const roleRoutes = require("./routes/role.routes.js");
const userRoutes = require("./routes/user.routes.js");

app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
