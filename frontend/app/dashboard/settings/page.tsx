import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <>
      <DashboardHeader 
        title="Settings" 
        description="Configure your voice analytics preferences"
      />
      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Application settings and preferences will be displayed here.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
