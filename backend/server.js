const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
 require("colors");
// Make sure to import this if you're using `.yellow.bold`

const { notFound, errorHandler } = require('./middleware/errorMiddleware');



require("dotenv").config();
connectDB();

const app = express();

app.use(express.json()); // ✅ Must come before routes

// Mount your routes
app.use("/api/user", userRoutes);
app.use("/api/chat",chatRoutes);

app.use(notFound);       // for handling 404 errors
app.use(errorHandler);   // for handling general errors

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`.yellow.bold);
});
