const express = require("express");
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require("body-parser");
const app = express();
const bcrypt = require('bcrypt');
const axios = require("axios");  // <-- Importing axios

require('dotenv').config();

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS
app.use(cors());

// Set up the MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "signup"
});


const saltRounds = 10;  // Number of salt rounds for bcrypt
const multer = require('multer');
const path = require('path');

// Create 'uploads' folder if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Setup multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage: storage });



// Signup route
app.post('/signup', upload.single('image'), (req, res) => {
    const { name, email, password } = req.body;
    const image = req.file ? req.file.filename : null;

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json("Error hashing password");
        }

        const sql = "INSERT INTO user (name, email, password, image) VALUES (?,?,?,?)";
        db.query(sql, [name, email, hashedPassword, image], (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json("Error with inserting");
            }
            return res.status(200).json({ message: "User registered successfully..", data: data });
        });
    });
});

app.use('/uploads', express.static('uploads'));



// For login
app.post('/login', (req, res) => {
    const sql = "SELECT * FROM user WHERE email = ?";
    const { email, password } = req.body;

    db.query(sql, [email], (err, data) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Server error during login" });
        }

        if (data.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = data[0];

        // Compare hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error("Password comparison error:", err);
                return res.status(500).json({ message: "Server error during password check" });
            }

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid password" });
            }

            // Return user details and image path
            return res.status(200).json({
                message: "Login successful",
                user: {
                    idUser: user.idUser,
                    name: user.name,
                    email: user.email,
                    image: user.image // Assuming 'image' is the filename or URL stored in the DB
                }
            });
        });
    });
});

app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "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"; // fallback if not using .env

const getChatGptResponse = async (userMessage, retries = 5) => {
  const apiEndpoint = "https://api.openai.com/v1/chat/completions";

  try {
    const response = await axios.post(
      apiEndpoint,
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.response?.status === 429 && retries > 0) {
      console.log(`Rate limit reached, retrying in ${6 - retries} seconds...`);
      await new Promise(resolve => setTimeout(resolve, (6 - retries) * 1000)); // gradual backoff
      return getChatGptResponse(userMessage, retries - 1);
    }

    console.error("Error getting response from OpenAI:", error.response?.data || error.message);
    return "Sorry, I couldn't process your request right now. Please try again later.";
  }
};

// API endpoint to receive the message
app.post("/api/message", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ response: "No message provided" });
  }

  // Get response from ChatGPT using OpenAI API
  const botResponse = await getChatGptResponse(message);

  // Send the response back to the frontend
  res.json({ response: botResponse });
});



// For viewing all users (only idUser, name, and email)
app.get('/users', (req, res) => {
    const sql = "SELECT idUser, name, email FROM user";  // Select only specific columns
    db.query(sql, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Error with querying the database");
        }

        if (data.length === 0) {
            return res.status(404).json("No users found");
        }

        return res.status(200).json({ users: data });  // Send filtered data
    });
});



// Start the server
app.listen(8081, () => {
    console.log("Listening on port 8081");
});
