import { Navbar } from "../components/Navbar";

export function Report() {
    return (
        <>
            <style>{
                `.report{
                    min-height: 100vh;
                    padding: 20px;
                    margin: 0;
                }
                .report-body{
                    max-width: 1200px;
                    margin: 0 auto;
                    background: rgba(30, 32, 47, 0.95);
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    padding: 30px;
                    backdrop-filter: blur(10px);
                    font-family: 'Inter', Tahoma, Geneva, Verdana, sans-serif;
                }
                .welcome-header {
                    font-size: 2.5rem;
                    color: #e2e8f0;
                    margin-bottom: 30px;
                    text-align: center;
                    font-weight: 300;
                }

                .navbar {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    width: 90%;
                    align-items:center;
                    margin-bottom: 40px;
                    padding: 20px;
                    background: linear-gradient(135deg, #2d3748, #4a5568);
                    border-radius: 15px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }

                .nav-item {
                    padding: 12px 24px;
                    background: #1a202c;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    color: #a0aec0;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                }

                .nav-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
                    background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%);
                    color: white;
                }

                .nav-item-active {
                    background: linear-gradient(135deg, #3b82f6 0%, #22c55e 100%);
                    color: white;
                }
                `
            }</style>
            <div className="report">
                <div className="report-body">
                    <h2 className="welcome-header">Report</h2>
                    <Navbar />
                </div>
            </div>
        </>
    )
}