import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="bg-dark text-white py-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-3">
            <h5 className="text-danger">Elegance India</h5>
            <p className="text-white-50">
              India's destination for modern and ethnic fashion trends.
            </p>
          </div>
          <div className="col-md-3">
            <h6 className="fw-bold">Quick Links</h6>
            <ul className="list-unstyled text-white-50">
              <li>
                <Link className="text-white-50 text-decoration-none" to="/shop">
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  className="text-white-50 text-decoration-none"
                  to="/fashion-fest"
                >
                  Fashion Fest
                </Link>
              </li>
              <li>
                <Link
                  className="text-white-50 text-decoration-none"
                  to="/ai-model"
                >
                  AI Stylist
                </Link>
              </li>
              <li>
                <Link
                  className="text-white-50 text-decoration-none"
                  to="/ai-stylist"
                >
                  AI Stylist
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6 className="fw-bold">Customer Support</h6>
            <ul className="list-unstyled text-white-50">
              <li>
                <a href="#" className="text-white-50 text-decoration-none">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-white-50 text-decoration-none">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-white-50 text-decoration-none">
                  Returns & Refunds
                </a>
              </li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6 className="fw-bold">Connect With Us</h6>
            <ul className="list-unstyled text-white-50">
              <li>
                <a href="#" className="text-white-50 text-decoration-none">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="text-white-50 text-decoration-none">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="text-white-50 text-decoration-none">
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-top border-secondary mt-4 pt-3 text-center text-white-50">
          &copy; 2025 Elegance India. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
