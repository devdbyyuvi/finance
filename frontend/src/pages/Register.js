import { useEffect, useState } from "react"
import { Input } from "../components/Input"

export function Register() {
    let [firstName, setFirstName] = useState(''),
        [lastName, setLastName] = useState(''),
        [email, setEmail] = useState(''),
        [pwd, setPwd] = useState(''),
        [confirmPwd, setConfirmPwd] = useState(''),
        [loading, setLoading] = useState(false),
        [error, setError] = useState(''),
        [success, setSuccess] = useState('');

    const handleFirstName = (e) => {
        setFirstName(e.target.value)
        },
        handleLastName = (e) => {
            setLastName(e.target.value)
        },
        handleEmail = (e) => {
            setEmail(e.target.value)
        },
        handlePWD = (e) => {
            setPwd(e.target.value)
        },
        handleConfirmPwd = (e) => {
            setConfirmPwd(e.target.value)
        };

    let formFields = [
        {
            label: "firstname",
            type: "text",
            name: "firstname",
            placeholder: "John",
            onchangeEvent : handleFirstName,
            value: firstName
        },
        {
            label: "lastname",
            type: "text",
            name: "lastname",
            placeholder: "Doe",
            onchangeEvent : handleLastName,
            value: lastName
        },
        {
            label: "email",
            type: "email",
            name: "email",
            placeholder: "john@doe.com",
            onchangeEvent : handleEmail,
            value: email
        },
        {
            label: "password",
            type: "password",
            name: "password",
            placeholder: "********",
            onchangeEvent: handlePWD,
            value: pwd
        },
        {
            label: "confirm password",
            type: "password",
            name: "confirmPassword",
            placeholder: "********",
            onchangeEvent : handleConfirmPwd,
            value: confirmPwd
        }
    ]
    const submitForm = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND}api/auth/register`   , {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password: pwd,
                    cpassword: confirmPwd
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Account created successfully!');
                // Clear form
                setFirstName('');
                setLastName('');
                setEmail('');
                setPwd('');
                setConfirmPwd('');
                
                window.location.href = '/login';
            } else {
                alert(data.error || 'Registration failed');
                setError(data.error || 'Registration failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="App">
            <h1>Register Page</h1>
            <p>Please fill out the form to create a new account.</p>
            
            {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
            {success && <div className="success-message" style={{color: 'green', marginBottom: '10px'}}>{success}</div>}
            
            <form onSubmit={submitForm}>
                {formFields.map((field, index) => (
                    <Input
                        key={index}
                        label={field.label}
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        onchange={field.onchangeEvent}
                        value={field.value}
                    />
                ))}
                <button type="submit" id="reg" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>
        </div>
    )
}