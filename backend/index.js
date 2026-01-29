import express from "express";
import cors from "cors";
import judgeRoutes from "./routes/judge.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", judgeRoutes);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
