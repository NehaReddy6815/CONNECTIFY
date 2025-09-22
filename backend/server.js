const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");


app.use(express.static("public"));
const cors = require("cors");
app.use(cors());





app.use(express.json());

console.log("MONGO_URI:", process.env.MONGO_URI);

//route to see all posts
const postRoutes = require("./routes/postRoutes");
app.use("/api/posts", postRoutes);



//auth route
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);


//user route
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

//comment route
const commentRoutes = require("./routes/commentRoutes");
app.use("/api/comments", commentRoutes);


//notifications route
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

//message route
const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);


const errorMiddleware = require("./middleware/errorMiddleware");
app.use(errorMiddleware); // must be after routes



const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Connectify backend is running!");
});


app.listen(5000, () => console.log(`Server running on port 5000`));
