export const Navbar = (t) => (
    <div className="navbar">
        <button onClick={()=>{
            window.location.href='/dashboard';
        }}>Dashboard</button>
        <button onClick={()=>{
            window.location = '/reports';
        }}>Reports</button>
        {t==='admin' && (
            <button onClick={()=>{
                window.location.href='/admin';
            }}>Admin</button>
        )}

        <button onClick={()=>{
            localStorage.removeItem('token');
            window.location.href='/login'
        }}>Logout</button>
    </div>
);