import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Sidemenu() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any authentication-related data (e.g., tokens)
    localStorage.removeItem("authToken");
    alert("You have been logged out.");
    navigate("/"); // Redirect to the login page
  };

  return (
    <>
      <aside className="app-sidebar" id="sidebar">
        <a href="/dashboard" className="header-logo"></a>
        <div className="main-sidebar" id="sidebar-scroll">
          <nav className="main-menu-container nav nav-pills flex-col sub-open">
            <div className="slide-left" id="slide-left"></div>
            <ul className="main-menu">
              <li className="slide__category">
                <span className="category-name">Main</span>
              </li>
              <li className="slide">
                <Link to="/dashboard" className="side-menu__item">
                  <i className="w-6 h-4 side-menu__icon bi bi-speedometer"></i>
                  <span className="side-menu__label">
                    Dashboard &ensp;
                    <span className="translate-middle badge !rounded-full bg-danger">10+</span>
                  </span>
                </Link>
              </li>
              <li className="slide">
                <Link to="/categories" className="side-menu__item">
                  <i className="w-6 h-4 side-menu__icon bi bi-grid"></i>
                  <span className="side-menu__label">Categories</span>
                </Link>
              </li>
              <li className="slide">
                <Link to="/suppliers" className="side-menu__item">
                  <i className="w-6 h-4 side-menu__icon bi bi-person-fill"></i>
                  <span className="side-menu__label">Suppliers</span>
                </Link>
              </li>
              <li className="slide">
                <Link to="/products" className="side-menu__item">
                  <i className="w-6 h-4 side-menu__icon bi bi-collection-fill"></i>
                  <span className="side-menu__label">Products</span>
                </Link>
              </li>
              <li className="slide">
                <Link to="/sales" className="side-menu__item">
                  <i className="w-6 h-4 side-menu__icon bi bi-cart-fill"></i>
                  <span className="side-menu__label">Sales</span>
                </Link>
              </li>

            </ul>
          </nav>
        </div>
        {/* Footer with Logout Button */}
        <div className="sidebar-footer">
          <button className="side-menu__item logout-button" onClick={handleLogout}>
            <i className="w-6 h-4 side-menu__icon bi bi-box-arrow-right"></i>
            <span className="side-menu__label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidemenu;