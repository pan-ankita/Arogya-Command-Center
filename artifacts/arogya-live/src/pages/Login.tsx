import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Activity, User, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { PublicLayout } from "@/layouts/PublicLayout";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");

  const loginMutation = useLogin();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { data: { username, password } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });

          // if (data.role === "district_admin") {
          //   setLocation("/admin/dashboard");
          // } else {
          //   setLocation("/facility/dashboard");
          // }
          if (data.role === "district_admin") {
            // window.history.replaceState({}, "", "/admin/dashboard");
            setLocation("/admin/dashboard");
          } else {
            // window.history.replaceState({}, "", "/facility/dashboard");
            setLocation("/facility/dashboard");
          }
        },
        onError: () => {
          toast({
            title: t("login_failed"),
            description: t("login_failed_desc"),
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleDemoFill = (type: "admin" | "staff") => {
    if (type === "admin") {
      setUsername("admin_hooghly");
      setPassword("admin1234");
      setRole("admin");
    } else {
      setUsername("rishra_phc");
      setPassword("demo1234");
      setRole("staff");
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-background">
        <Card
          className="w-full max-w-md shadow-lg border-border"
          data-testid="card-login"
        >
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-primary p-3 rounded-xl text-primary-foreground shadow-sm">
                <Activity className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">{t("welcome_back")}</CardTitle>
            <CardDescription>
              {t("login_description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={setRole} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="staff" data-testid="tab-staff">
                  <User className="mr-2 h-4 w-4" />
                  {t("facility_staff")}
                </TabsTrigger>
                <TabsTrigger value="admin" data-testid="tab-admin">
                  <Shield className="mr-2 h-4 w-4" />
                  {t("district_admin")}
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t("username")}</Label>
                  <Input 
                    id="username" 
                    placeholder={t("username_placeholder")} 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    data-testid="input-username"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t("password")}</Label>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder={t("password_placeholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 text-base mt-2"
                  disabled={loginMutation.isPending}
                  data-testid="btn-submit-login"
                >
                  {loginMutation.isPending ? (
                   <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                       t("sign_in")
                    )}
                </Button>
              </form>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t bg-background/50 p-6">
            <div className="text-sm font-medium text-slate-500 mb-2">{t("demo_credentials")}</div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button variant="outline" className="text-xs h-auto py-2 flex flex-col items-start gap-1" onClick={() => handleDemoFill("staff")}>
                <span className="font-semibold bg-background/50">{t("staff_demo")}</span>
                <span className="text-slate-500 font-mono">rishra_phc / demo1234</span>
              </Button>
              <Button variant="outline" className="text-xs h-auto py-2 flex flex-col items-start gap-1" onClick={() => handleDemoFill("admin")}>
                <span className="font-semibold text-muted-foreground">{t("admin_demo")}</span>
                <span className="text-slate-500 font-mono">admin_hooghly / admin1234</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </PublicLayout>
  );
}
