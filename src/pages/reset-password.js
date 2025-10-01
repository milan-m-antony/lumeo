import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, Save, CheckCircle, AlertCircle, Loader2, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast";
import { Textarea } from '@/components/ui/textarea';


export default function ResetPasswordPage() {
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { updatePasswordWithToken } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    useEffect(() => {
        if (router.isReady) {
            const hash = window.location.hash;
            const accessToken = new URLSearchParams(hash.substring(1)).get('access_token');
            if (accessToken) {
                setToken(accessToken);
                toast({
                    title: "Token Detected",
                    description: "Your access token has been automatically filled in. Please set a new password."
                });
                // Clean the URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, [router.isReady, toast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        if (!token) {
            setError("The access token is missing. Please copy it from the email link URL.");
            return;
        }

        setError(null);
        setSuccess(false);
        setLoading(true);
        try {
            await updatePasswordWithToken(token, password);
            setSuccess(true);
            toast({
                title: "Password Updated!",
                description: "You can now log in with your new password.",
            });
            setTimeout(() => router.push('/login'), 3000);
        } catch (err) {
            setError(err.message || 'Failed to reset password. The token may be invalid or expired.');
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
                        <p className="text-white/60 text-xs">Copy the token from your email's reset link and set a new password.</p>
                    </div>

                    {success ? (
                        <Alert variant="default" className="bg-green-500/10 border-green-500/30">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <AlertTitle className="text-green-400">Password Reset!</AlertTitle>
                            <AlertDescription className="text-white/80">
                                Your password has been updated. Redirecting you to login...
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
                                <Hash className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                                <Textarea
                                    placeholder="Paste access token here..."
                                    required
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-24 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                />
                            </div>
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
                                  {showPassword ? <Eye className="w-4 h-4 text-white/40 hover:text-white" /> : <EyeOff className="w-4 h-4 text-white/40 hover:text-white" />}
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /><span>Update Password</span></>}
                            </Button>
                        </form>
                    )}
                     <div className="text-center mt-6">
                        <Link href="/login" passHref>
                            <Button variant="ghost" className="text-white/60 hover:text-white">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
