import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client';
import axios from "axios";
import "../css/Home.css";

function Attendance() {

    const [diemDanh, setDiemDanh] = useState([]);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleToggleClick = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    useEffect(() => {

        axios.get('http://localhost:5000/get-all')
            .then(res => setDiemDanh(res.data));

        const socket = io('http://localhost:5000');

        socket.on('add-record', (record) => {
            setDiemDanh(diemDanh => [...diemDanh, record]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);


    return (
        <div className="wrapper">
            {/* <!-- Sidebar --> */}
            <aside id="sidebar" className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} bg-dark`}>
                <div className="h-100">
                    <div className="sidebar-logo border-bottom mb-4">
                        <a href="#">NHÓM 13 - IOT</a>
                    </div>
                    {/* <!-- Sidebar Navigation --> */}
                    <ul className="sidebar-nav">
                        <li className="sidebar-item">
                            <a  className="sidebar-link">
                                <i className="bi bi-gear-wide-connected"></i>{" "}
                                DASHBOARDS
                            </a>
                        </li>
                        <li className="sidebar-item">
                            <a className="sidebar-link ">
                                <i className="bi bi-person-circle"></i>{" "}
                                USER PROFILE
                            </a>
                        </li>
                        <li className="sidebar-item">
                            <a className="sidebar-link ">
                                <i className="bi bi-alarm"></i>{" "}
                                ATTENDANCE
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>
            {/* <!-- Main Component --> */}
            <div className="main">
                <nav className="navbar navbar-expand px-3 border-bottom">
                    {/* <!-- Button for sidebar toggle --> */}
                    <button className="btn" type="button" data-bs-theme="dark" onClick={handleToggleClick}>
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </nav>
                <main className="content px-3 py-2">
                    <div className="container-fluid">
                        <table className="table table-bordered mx-2 border-2 border-dark shadow-lg">
                            <thead>
                                <tr className='bg-success'>
                                    <th className="text-center">Id</th>
                                    <th className="text-center">timeIn</th>
                                    <th className="text-center">timeOut</th>
                                    <th className="text-center">trangThai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {diemDanh.map((nv) => (
                                    <tr key={nv.id} className={nv.trangThai === 1 ? 'bg-sky-300' : 'bg-rose-300'}>
                                        <td className='w-1.5'>{nv.idNhanVien}</td>
                                        <td>{nv.timeIn}</td>
                                        <td>{nv.timeOut} </td>
                                        <td>{nv.trangThai}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    )
}
export default Attendance;