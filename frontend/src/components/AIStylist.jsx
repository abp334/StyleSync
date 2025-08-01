import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AIStylist.css";

export default function AIStylist({ setRecommendations }) {
  const [file, setFile] = useState(null);
  const [season, setSeason] = useState("Summer");
  const [usage, setUsage] = useState("Casual");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!file) {
      setError("Please upload an image.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("season", season);
    formData.append("usage", usage);

    try {
      // CORRECTED: Pointing to your Django server on port 8001
      const response = await axios.post(
        "http://127.0.0.1:8001/api/stylist/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.recommendations) {
        setRecommendations(response.data.recommendations);
        navigate("/shop");
      } else {
        setError("Failed to get recommendations from the server.");
      }
    } catch (err) {
      setError("An error occurred while fetching recommendations.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stylist-container">
      <h2>AI Fashion Stylist</h2>
      <p>Upload your photo and let our AI find the perfect outfits for you.</p>

      <form onSubmit={handleSubmit} className="stylist-form">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          required
        />
        <div className="form-inputs">
          <select value={season} onChange={(e) => setSeason(e.target.value)}>
            <option>Summer</option>
            <option>Winter</option>
            <option>Fall</option>
            <option>Spring</option>
          </select>
          <select value={usage} onChange={(e) => setUsage(e.target.value)}>
            <option>Casual</option>
            <option>Formal</option>
            <option>Sports</option>
            <option>Party</option>
            <option>Work</option>
            <option>Ethnic</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Get Recommendations"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
