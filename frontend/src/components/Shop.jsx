import { useState } from "react";
import { Star, Grid, List } from "lucide-react";
// We no longer need axios here because we are not making an API call
// export default function ShopPage({ recommendations = [], cartItems, setCartItems }) { // This line is likely from your main.jsx
export default function Shop({
  recommendations = [],
  cartItems,
  setCartItems,
}) {
  // Corrected prop name
  const [viewMode, setViewMode] = useState("grid");

  const addToCart = (productToAdd) => {
    // This function now updates the local state managed by main.jsx
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.id === productToAdd.id
      );
      if (existingItem) {
        // If item exists, increase its quantity
        return prevItems.map((item) =>
          item.id === productToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Otherwise, add the new item with quantity 1
      return [...prevItems, { ...productToAdd, quantity: 1 }];
    });
    alert(`${productToAdd.productDisplayName} has been added to your bag!`);
  };

  const renderProductCard = (product) => (
    <div key={product.id} className="col">
      <div className="card h-100 shadow-sm">
        <img
          src={product.image_url}
          alt={product.productDisplayName}
          className="card-img-top"
          style={{ height: "300px", objectFit: "cover" }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/300x400/EEE/31343C?text=Image+Not+Found";
          }}
        />
        <div className="card-body d-flex flex-column">
          <p className="text-muted small mb-1">
            {product.articleType || "Fashion"}
          </p>
          <h5 className="card-title">{product.productDisplayName}</h5>
          <div className="d-flex align-items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`me-1 text-warning`}
                size={14}
                fill={"currentColor"}
              />
            ))}
            <span className="ms-2 text-muted small">(Recommended)</span>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <div>
              <span className="fw-bold text-danger fs-5 me-2">
                ₹{product.price_inr}
              </span>
            </div>
            <button
              className="btn btn-danger rounded-pill"
              onClick={() =>
                addToCart({
                  id: product.id,
                  name: product.productDisplayName,
                  price: product.price_inr,
                  image: product.image_url,
                })
              }
            >
              Add to Bag
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 bg-light bg-gradient">
      <header className="bg-white py-5 text-center">
        <h1 className="display-5 fw-light">Shopping Collection</h1>
        <p className="text-muted fs-5">
          Explore trending ethnic and fusion styles
        </p>
      </header>
      <div className="bg-white border-top border-bottom py-3">
        <div className="container d-flex justify-content-end align-items-center gap-3">
          <div className="d-flex gap-2">
            <button
              className={`btn ${
                viewMode === "grid" ? "btn-danger" : "btn-outline-secondary"
              }`}
              onClick={() => setViewMode("grid")}
            >
              <Grid size={16} />
            </button>
            <button
              className={`btn ${
                viewMode === "list" ? "btn-danger" : "btn-outline-secondary"
              }`}
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {recommendations && recommendations.length > 0 && (
        <section className="container py-5">
          <h2 className="mb-4">Recommended For You</h2>
          <div
            className={`row g-4 ${
              viewMode === "grid"
                ? "row-cols-1 row-cols-md-2 row-cols-lg-3"
                : "row-cols-1"
            }`}
          >
            {recommendations.map(renderProductCard)}
          </div>
        </section>
      )}
    </div>
  );
}
