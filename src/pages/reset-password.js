import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { updatePassword, user } = useAuth();
    const router = useRouter();
    
    // This effect handles the case where a user lands on this page without being in the "recovery" state.
    useEffect(() => {
        if (!user) {
            const hash = window.location.hash;
            if (!hash.includes('access_token')) {
                 router.replace('/login');
            }
        }
    }, [user, router]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setError(null);
        setSuccess(false);
        setLoading(true);
        try {
            await updatePassword(password);
            setSuccess(true);
            setTimeout(() => router.push('/gallery'), 3000); // Redirect after a short delay
        } catch (err) {
            setError(err.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 z-0" style={{
                backgroundImage: 'radial-gradient(circle at top left, hsl(var(--primary) / 0.5) 0%, hsl(var(--background)) 30%)',
                backgroundAttachment: 'fixed'
            }} />
            <div className="absolute inset-0 bg-black/40 z-0" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-sm relative z-10"
            >
                <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl overflow-hidden">
                    <div className="text-center space-y-2 mb-6">
                        <h1 className="text-xl font-bold text-white">Reset Your Password</h1>
                        <p className="text-white/60 text-xs">Enter a new password for your account.</p>
                    </div>

                    {success ? (
                        <Alert variant="default" className="bg-green-500/10 border-green-500/30">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <AlertTitle className="text-green-400">Password Reset!</AlertTitle>
                            <AlertDescription className="text-white/80">
                                Your password has been updated. Redirecting you now...
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                             {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3 w-4 h-4 text-white/40" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                                />
                                <div onClick={() => setShowPassword(!showPassword)} className="absolute right-3 cursor-pointer">
                                  {showPassword ? <Eye className="w-4 h-4 text-white/40" /> : <EyeOff className="w-4 h-4 text-white/40" />}
                                </div>
                            </div>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3 w-4 h-4 text-white/40" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                                />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /><span>Update Password</span></>}
                            </Button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
