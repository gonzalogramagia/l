import { Navbar } from '../components/nav'
import Footer from '../components/footer'

export default function DefaultLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="max-w-xl mx-4 mt-8 lg:mx-auto">
            <main className="flex-auto min-w-0 mt-6 flex flex-col px-8 lg:px-0">
                <Navbar />
                {children}
                <Footer />
            </main>
        </div>
    )
}
