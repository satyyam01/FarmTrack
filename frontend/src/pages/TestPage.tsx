import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TestPage() {
  const { user, loading, logout } = useUser();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Loading State:</h3>
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading..." : "Loaded"}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">User State:</h3>
              {user ? (
                <div className="space-y-2">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Farm ID:</strong> {user.farm_id || "None"}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No user logged in</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Local Storage:</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Token:</strong> {localStorage.getItem('token') ? "Present" : "Not found"}</p>
                <p><strong>User:</strong> {localStorage.getItem('user') ? "Present" : "Not found"}</p>
              </div>
            </div>

            {user && (
              <Button onClick={logout} variant="destructive">
                Logout
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 