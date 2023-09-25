import './App.css';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import Home from './components/Home';
import Attendance from './components/Attendance';

function App() {
    return (
        <BrowserRouter>
            <div>
                <Routes>
                    <Route path='/' element= {<Home></Home>}></Route>
                    <Route path='/attendance' element= {<Attendance></Attendance>}></Route>
                </Routes>
            </div>
        </BrowserRouter>
    );
}
export default App;