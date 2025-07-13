export const Navbar = () => (
    <div className="navbar">
        <button onClick={()=>{
            window.location.href='/dashboard';
        }}>Dashboard</button>
        <button>Reports</button>
        <button>Profile</button>
        <button>Logout</button>
    </div>
);