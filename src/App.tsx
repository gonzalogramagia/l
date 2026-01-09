import Home from './pages/Home'
import Footer from './components/footer'
import { ScrollToBottom } from './components/scroll-to-bottom'

function App() {
    return (
        <div className="max-w-4xl mx-4 mt-8 lg:mx-auto">
            <main className="flex-auto min-w-0 mt-6 flex flex-col px-8 lg:px-0">
                <Home />
                <Footer />
                <ScrollToBottom />
            </main>
        </div>
    )
}

export default App
