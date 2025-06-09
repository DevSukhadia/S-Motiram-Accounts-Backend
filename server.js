const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const roleRoutes = require("./routes/role.routes.js");
const userRoutes = require("./routes/user.routes.js");
const companyRoutes = require("./routes/company.routes.js");
const transactionRoutes = require("./routes/transaction.routes.js");
const categoryRoutes = require("./routes/category.routes.js");

app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));