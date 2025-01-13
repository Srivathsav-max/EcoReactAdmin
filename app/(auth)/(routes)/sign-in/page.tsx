"use client";

import { useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include', // Important: include credentials
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }

      toast.success('Signed in successfully');
      router.push('/'); // This will now work with the cookie auth
      router.refresh(); // Force refresh to update auth state
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Sign In">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthCard>
  );
}
