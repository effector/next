export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />;
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} />;
}

export function Option(props: React.OptionHTMLAttributes<HTMLOptionElement>) {
  return <option {...props} />;
}

export function Link(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} />;
}

export function Form(props: React.FormHTMLAttributes<HTMLFormElement>) {
    return <form {...props} />;
}

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return <label {...props} />;
}

export function Loader() {
    return <div>Loading...</div>;
}
