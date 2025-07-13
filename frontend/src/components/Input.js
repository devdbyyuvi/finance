export function Input({ label, type, name, placeholder, onchange}) {
    return (
        <div className="input-field">
            <label htmlFor={name}>{label}</label>
            <input type={type} name={name} id={name} placeholder={placeholder} onChange={onchange} />
        </div>
    );
}