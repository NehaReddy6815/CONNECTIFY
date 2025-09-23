import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });

      alert(res.data.message); // "User created successfully"
      console.log("User:", res.data.user);
      console.log("Token:", res.data.token);

      // You can also save token in localStorage
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating account");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 w-72 border p-6 rounded shadow"
      >
        <h2 className="text-xl font-bold mb-2">Create Account</h2>
        <input
          type="text"
          placeholder="Name"
          className="border p-2"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Register;
