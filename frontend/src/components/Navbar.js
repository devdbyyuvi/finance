export const Navbar = () => (
    <div className="navbar">
        <button onClick={()=>{
            window.location.href='/dashboard';
        }}>Dashboard</button>
        <button onClick={()=>{
            window.location = '/reports';
        }}>Reports</button>
        <button onClick={()=>{
            window.location.href='/profile';
        }}>Profile</button>
        <button>Logout</button>
    </div>
);