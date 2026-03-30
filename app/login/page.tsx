import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { login, signup } from "./actions"

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-[400px] p-6">
        <div className="flex flex-col space-y-2 text-center mb-8">
          <h1 className="text-3xl font-syne font-semibold tracking-tight text-white drop-shadow-md">
            TaskMaster
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Enter your credentials to access your dashboard
          </p>
        </div>

        {searchParams?.message && (
          <div className="mb-6 rounded-md bg-destructive/15 p-3 text-sm text-destructive font-bold text-center border border-destructive/50">
            {searchParams.message}
          </div>
        )}


        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required className="border-border focus-visible:ring-themeGreen" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input id="password" name="password" type="password" required className="border-border focus-visible:ring-themeGreen" />
              </div>
              <Button formAction={login} className="w-full bg-themeGreen hover:bg-themeGreen/90 text-background font-bold transition-all mt-4">
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-foreground">Email</Label>
                <Input id="register-email" name="email" type="email" placeholder="m@example.com" required className="border-border focus-visible:ring-themeCyan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-foreground">Password</Label>
                <Input id="register-password" name="password" type="password" required className="border-border focus-visible:ring-themeCyan" />
              </div>
              <Button formAction={signup} className="w-full bg-themeCyan hover:bg-themeCyan/90 text-background font-bold transition-all mt-4">
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="px-8 mt-6 text-center text-sm text-muted-foreground font-mono">
          By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
