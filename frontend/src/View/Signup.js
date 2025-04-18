import React, { useState } from "react";
import "./static/Signup.css";
import { validateSignup } from "../Controller/SignupValidation";
import axios from "axios";
import { useNavigate } from "react-router";

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploadPreview, setUploadPreview] = useState(null); // Optional preview

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setUploadPreview(URL.createObjectURL(file)); // Optional preview
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateSignup(name, email, password);
    if (Object.keys(validationErrors).length === 0) {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      if (image) {
        formData.append("image", image);
      }

      axios
        .post("http://localhost:8081/signup", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          console.log("Signup successful:", response.data);
          navigate("/"); // Redirect to login or home
        })
        .catch((error) => {
          console.error("There was an error with the signup:", error);
        });
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">Create an Account</h2>
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>

          <div className="input-group">
            <label>Upload Profile Picture</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {uploadPreview && (
              <img
                src={uploadPreview}
                alt="Preview"
                style={{ marginTop: "10px", width: "100px", borderRadius: "8px" }}
              />
            )}
          </div>

          <button type="submit" className="signup-btn">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
