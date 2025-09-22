import React, { useState } from "react";
import Button from "./Button";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Enter details");
    onLogin({ email, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto p-6 bg-white shadow rounded mt-10 flex flex-col gap-3"
    >
      <h2 className="text-xl font-bold text-center mb-2">Login to Connectify</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded px-3 py-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded px-3 py-2"
      />
      <Button type="submit">Login</Button>
    </form>
  );
};

export default Login;
