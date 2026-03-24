import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import 
import userRouter from './routes/user.routes.js';

// routes
app.use("/api/v1/users", userRouter);

// ✅ GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.error("ERROR:", err.message);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Something went wrong"
    });
});

export { app };