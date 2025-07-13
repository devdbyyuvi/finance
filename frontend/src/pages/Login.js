import { useState } from "react";
import { Input } from "../components/Input"

export function Login() {
    const [email,setEmail] = useState('');
    const [pwd, setPWD] = useState('');
    const handleEmail = (e) =>{
        setEmail(e.target.value);
    }
    const handlePWD = (e)=>{
        setPWD(e.target.value);
    }
        let formFields = [
        { label: "Email", type: "email", name: "email", placeholder: "john@doe.com", onchangeEvent : handleEmail },
        { label: "Password", type: "password", name: "password", placeholder: "********", onchangeEvent : handlePWD },
    ]
    return (
        <div class="App">
            <h1>Login Page</h1>
            <p>Please enter your credentials to log in.</p>
            <form>
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
                <button type="submit" id="login">Login</button>
            </form>
        </div>
    )
}