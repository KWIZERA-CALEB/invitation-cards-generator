import {Routes, Route} from 'react-router-dom'
import Landing from './pages/Landing'
import EditCanvas from './pages/EditCanvas'

const App = () => {
    return (
        <>
            <Routes>
                <Route path='/' element={<Landing />} />
                <Route path='/create-design' element={<EditCanvas />} />
            </Routes>
        </>
    )
}

export default App