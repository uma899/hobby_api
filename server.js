import express from "express";
import cors from "cors";
import users from "./routes/users.js";
import protectedRoutes from "./routes/protected.js"

const PORT = 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/users", users);
app.use('/protected', protectedRoutes);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
