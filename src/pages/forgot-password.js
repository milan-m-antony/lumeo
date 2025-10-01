import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from 'next/router';
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { sendPasswordResetEmail } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);
        try {
            await sendPasswordResetEmail(email);
            setSuccess(true);
            toast({
                title: "Email Sent!",
                description: "Check your inbox for a password reset token.",
            });
            router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err) {
            setError(err.message || 'Failed to send reset email.');
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
                        <h1 className="text-xl font-bold text-white">Forgot Password</h1>
                        <p className="text-white/60 text-xs">Enter your email to receive a password reset token.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {success && (
                            <Alert variant="default" className="bg-green-500/10 border-green-500/30">
                                <CheckCircle className="h-4 w-4 text-green-400" />
                                <AlertTitle className="text-green-400">Email Sent!</AlertTitle>
                                <AlertDescription className="text-white/80">
                                    Redirecting you to enter the token from your email.
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="relative flex items-center">
                            <Mail className="absolute left-3 w-4 h-4 text-white/40" />
                            <Input
                                type="email"
                                placeholder="Email address"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                            />
                        </div>
                        <Button type="submit" disabled={loading || success} className="w-full">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /><span>Send Reset Token</span></>}
                        </Button>
                    </form>

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
