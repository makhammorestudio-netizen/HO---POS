import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-background to-secondary">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-primary">
                    Luxe Salon POS
                </h1>
                <div className="text-muted-foreground">v1.0.0</div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-6xl">
                {/* POS Card */}
                <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-all flex flex-col">
                    <h2 className="text-xl font-semibold mb-2 text-primary">POS Terminal</h2>
                    <p className="text-muted-foreground mb-4 flex-1">Process new sales, manage cart, and handle checkout.</p>
                    <Link href="/pos" className="w-full">
                        <Button className="w-full">Open POS</Button>
                    </Link>
                </div>

                {/* Reports Card */}
                <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-all flex flex-col">
                    <h2 className="text-xl font-semibold mb-2 text-primary">Daily Reports</h2>
                    <p className="text-muted-foreground mb-4 flex-1">View daily sales breakdowns and performance metrics.</p>
                    <Link href="/reports" className="w-full">
                        <Button variant="outline" className="w-full">View Reports</Button>
                    </Link>
                </div>

                {/* Staff Card */}
                <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-all flex flex-col">
                    <h2 className="text-xl font-semibold mb-2 text-primary">Staff & Commissions</h2>
                    <p className="text-muted-foreground mb-4 flex-1">Manage employees and view commission logs.</p>
                    <Link href="/staff" className="w-full">
                        <Button variant="outline" className="w-full">Manage Staff</Button>
                    </Link>
                </div>

                {/* Customers Card */}
                <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-all flex flex-col">
                    <h2 className="text-xl font-semibold mb-2 text-primary">Customers</h2>
                    <p className="text-muted-foreground mb-4 flex-1">Manage customer profiles and loyalty points.</p>
                    <Link href="/customers" className="w-full">
                        <Button variant="outline" className="w-full">View Customers</Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
