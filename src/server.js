const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// Middleware
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
    })
);

app.use(express.json());

// Test Backend
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Portfolio Backend API is running",
    });
});

// Contact Form API
app.post("/api/contact", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate form fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields.",
            });
        }

        // Validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        // Create email transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        });

        // Email details
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECEIVER_EMAIL,
            replyTo: email,
            subject: `Portfolio Contact: ${subject}`,
            text: `
New message from your Portfolio Contact Form.

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: "Your message has been sent successfully!",
        });
    } catch (error) {
        console.error("Email sending error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to send email. Please try again later.",
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});