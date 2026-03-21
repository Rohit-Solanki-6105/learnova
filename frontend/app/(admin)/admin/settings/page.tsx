import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Settings, Globe, Shield, Bell } from "lucide-react"

export default function AdminSettingsPage() {
    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">General Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="dark:bg-gray-800 border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-3">
                        <Globe className="h-5 w-5 text-rose-500" />
                        <CardTitle className="text-lg">Website Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Platform Name</label>
                            <input type="text" defaultValue="Learnova" className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contact Email</label>
                            <input type="email" defaultValue="admin@learnova.com" className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-3">
                        <Shield className="h-5 w-5 text-rose-500" />
                        <CardTitle className="text-lg">Security & Access</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Allow Guest Self-Registration</span>
                            <div className="w-10 h-5 bg-rose-500 rounded-full relative">
                                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Require Email Verification</span>
                            <div className="w-10 h-5 bg-gray-300 rounded-full relative">
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
