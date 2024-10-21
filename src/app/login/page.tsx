'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaGoogle, FaGithub } from 'react-icons/fa';
import BlurIn from "@/components/ui/blur-in";
import { z } from 'zod';
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { Loader2 } from 'lucide-react'; // Import the spinner icon
import { ZodError } from 'zod';

const loginSchema = z.object({
  memberId: z.string().email(),
  password: z.string().min(5),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5),
});

export default function LoginPage() {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("login");

  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = () => {
    if (error) setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    let formObject;
    try {
      if (event.currentTarget.id === "login") {
        formObject = {
          memberId: event.currentTarget.memberId.value,
          password: event.currentTarget.password.value,
        }
        const validatedData = loginSchema.parse(formObject);
        const result = await signIn('credentials', {
          redirect: false,
          email: validatedData.memberId,
          password: validatedData.password,
        });

        if (result?.error) {
          throw new Error(result.error);
        } else {
          toast({
            title: "Success",
            description: "Logged in successfully",
            duration: 3000,
          });
          router.push('/dashboard');
        }
      } else {
        formObject = {
          email: event.currentTarget.email.value,
          password: event.currentTarget.password.value,
        }
        const validatedData = signupSchema.parse(formObject);
        
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
          throw new Error('Signup failed');
        }

        const result = await signIn('credentials', {
          redirect: false,
          email: validatedData.email,
          password: validatedData.password,
        });

        if (result?.error) {
          throw new Error(result.error);
        } else {
          toast({
            title: "Success",
            description: "Signed up and logged in successfully",
            duration: 3000,
          });
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof ZodError) {
        const fieldErrors = error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {} as Record<string, string>);
        
        if (fieldErrors.email || fieldErrors.memberId) {
          setError("Please enter a correct email address");
        } else if (fieldErrors.password) {
          setError("Password must be at least 5 characters long");
        } else {
          setError("An unexpected error occurred");
        }
      } else {
        // For API response errors, use toast instead of setError
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          duration: 3000,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError(null); 
  };

  return (
    <SessionProvider>
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Card className="w-full max-w-[450px] h-[600px] border-0 bg-black/40 rounded-lg overflow-hidden shadow-2xl backdrop-blur-xl p-4">
        <CardHeader className="px-4 pt-4 pb-4">
          <CardTitle className=" font-bold text-white">
           
              <BlurIn word="Welcome to" className='text-left' />
              <BlurIn word="Google Developer Groups" className=' text-blue-700 text-left'/>            
         
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 pb-6">
          <Card className='bg-black/40 border border-gray-800 rounded-lg overflow-hidden shadow-2xl backdrop-blur-xl px-4 sm:px-6 py-8 h-[380px] sm:h-[350px] sm:p-6'>
            <Tabs defaultValue="login" className="w-full" onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-900/50 rounded-md p-1 h-12 sm:h-10">
                <TabsTrigger value="login" className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 h-8">Login</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 h-8">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="space-y-6 relative" id="login">
                  <div className="space-y-1">
                    <Label htmlFor="memberId" className="text-gray-300 text-sm font-medium">Member Email</Label>
                    <Input id="memberId" name="memberId" 
                        placeholder="Enter your email" type="text" required 
                        className="h-12 sm:h-10 "
                        onChange={handleInputChange} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-gray-300 text-sm font-medium">Password</Label>
                    <Input id="password" name="password"
                        placeholder="Enter your password" type="password" required 
                        className="h-12 sm:h-10 "
                        onChange={handleInputChange} />
                  </div>
                  <div className='w-full left-0 absolute bottom-12'> {/* This div creates constant space */}
                    {error && <p className="text-red-500 text-xs left-0 ">{error}</p>}
                  </div>
                  <Button className="flex items-center justify-center w-full h-12 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white text-md font-medium rounded-md transition-all duration-200 p-2" type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Login"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSubmit} className="space-y-6 mt-2 relative" id="signup">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-gray-300 text-sm font-medium">Email</Label>
                    <Input id="email" name="email" placeholder="Enter your email" type="email" required 
                        className="h-12 sm:h-10 "
                        onChange={handleInputChange} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signupPassword" className="text-gray-300 text-sm font-medium">Password</Label>
                    <Input id="signupPassword" name="password" placeholder="Create a password" type="password" required 
                        className="h-12 sm:h-10 "
                        onChange={handleInputChange} />
                  </div>
                  <div className='w-full left-0 absolute bottom-12'> {/* This div creates constant space */}
                    {error && <p className="text-red-500 text-xs left-0">{error}</p>}
                  </div>
                  <Button className="flex items-center justify-cente w-full h-12 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-all duration-200 p-2 " type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
          
          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700"></span>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-black px-2 text-gray-400">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="default" className="h-12 sm:h-10  flex items-center justify-center rounded-md p-2" onClick={() => handleProviderSignIn('google')}>
                <FaGoogle className="mr-2 h-4 w-4" /> Google
              </Button>
              <Button variant="default" className="h-12 sm:h-10  flex items-center justify-center rounded-md p-2" onClick={() => handleProviderSignIn('github')}>
                <FaGithub className="mr-2 h-4 w-4" /> GitHub
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </SessionProvider>
  );
}
