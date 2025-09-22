const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>Connectify</h2>
      </div>
      
      <div className="nav-user">
        <span>Welcome, {user.name}</span>
        <button onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;