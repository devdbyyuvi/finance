import { useState } from "react";
import { Input } from "../components/Input"

export function Login() {
    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState(''),
        [loading, setLoading] = useState(false),
        [error, setError] = useState(''),
        [success, setSuccess] = useState('');

    const handleEmail = (e) => {
        setEmail(e.target.value);
    }
    const handlePWD = (e) => {
        setPwd(e.target.value);
    }
    let formFields = [
        { label: "Email", type: "email", name: "email", placeholder: "john@doe.com", onchangeEvent: handleEmail },
        { label: "Password", type: "password", name: "password", placeholder: "********", onchangeEvent: handlePWD },
    ]
    const submitForm = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND}api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password: pwd,
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Account created successfully!');
                // Clear form
                setEmail('');
                setPwd('');
                window.location.href = '/dashboard';
            } else {
                alert(data.error || 'Login failed');
                setError(data.error || 'Login failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="App">
            <h1>Login Page</h1>
            <p>Please enter your credentials to log in.</p>

            {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            {success && <div className="success-message" style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

            <form onSubmit={submitForm}>
                {formFields.map((field, index) => (
                    <Input
                        key={index}
                        label={field.label}
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        onchange={field.onchangeEvent}
                    />
                ))}
                <button type="submit" id="login" disabled={loading}>
                    {loading ? 'Getting in...' : 'Login'}
                </button>
            </form>
        </div>
    )
}