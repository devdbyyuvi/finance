import logo from './logo.svg';

function App() {
  return (
    <div className="App">
      <h1>
        Your Personal Finance Tracker
      </h1>
      <p>
        Welcome to your personal finance tracker! Here you can manage your budget, track transactions, and view your financial health.
      </p>
      <div className='btn-flex'>
        <a href='/login'>Login</a>
        <a href='/register'>Register</a>
      </div>
    </div>
  );
}

export default App;
