import './App.css';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import Home from './components/Home';
import Attendance from './components/Attendance';
import Anh from './components/Anh';

function App() {
    return (
        <BrowserRouter>
            <div>
                <Routes>
                    <Route path='/anh' element={<Anh></Anh>}></Route>
                    <Route path='/profile' element= {<Home></Home>}></Route>
                    <Route path='/attendance' element= {<Attendance></Attendance>}></Route>
                </Routes>
            </div>
        </BrowserRouter>
    );
}
export default App;