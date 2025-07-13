import { useEffect, useState } from "react"
import { Input } from "../components/Input"

export function Register() {
    let [firstName, setFirstName] = useState(''),
        [lastName, setLastName] = useState(''),
        [email, setEmail] = useState(''),
        [pwd, setPwd] = useState(''),
        [confirmPwd, setConfirmPwd] = useState('');
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
            placeholder: "John Doe",
            onchangeEvent : handleFirstName
        },
        {
            label: "lastname",
            type: "text",
            name: "lastname",
            placeholder: "Doe",
            onchangeEvent : handleLastName
        },
        {
            label: "email",
            type: "email",
            name: "email",
            placeholder: "john@doe.com",
            onchangeEvent : handleEmail
        },
        {
            label: "password",
            type: "password",
            name: "password",
            placeholder: "********",
            onchangeEvent: handlePWD
        },
        {
            label: "confirm password",
            type: "password",
            name: "confirmPassword",
            placeholder: "********",
            onchangeEvent : handleConfirmPwd
        }
    ]

    return (
        <div className="App">
            <h1>Register Page</h1>
            <p>Please fill out the form to create a new account.</p>
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
                <button type="submit" id="reg">Create Account</button>
            </form>
        </div>
    )
}