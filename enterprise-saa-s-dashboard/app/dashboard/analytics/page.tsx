import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsPage() {
  return (
    <>
      <DashboardHeader 
        title="Analytics" 
        description="Detailed voice feedback analytics"
      />
      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Detailed analytics and reporting features will be displayed here.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
