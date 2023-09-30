import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client';
import axios from "axios";
import "../css/Home.css";

function Attendance() {
    const navigate = useNavigate();
    const [diemDanh, setDiemDanh] = useState([]);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const onAttendance = () => {
        navigate(`/attendance`);
    }

    const onProfile = () => {
        navigate(`/profile`);
    }

    const handleToggleClick = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    useEffect(() => {

        axios.get('http://localhost:5000/get-all')
            .then(res => {
                setDiemDanh(res.data)
                console.log(res);
            });

        const socket = io('http://localhost:5000');

        socket.on('add-record', (record) => {
            setDiemDanh(diemDanh => [...diemDanh, record]);
            console.log(record)
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
                            <a className="sidebar-link">
                                <i className="bi bi-gear-wide-connected"></i>{" "}
                                DASHBOARDS
                            </a>
                        </li>
                        <li className="sidebar-item" onClick={() => onProfile()}>
                            <a href="#" className="sidebar-link ">
                                <i className="bi bi-person-circle"></i>{" "}
                                USER PROFILE
                            </a>
                        </li>
                        <li className="sidebar-item" onClick={() => onAttendance()}>
                            <a href="#" className="sidebar-link ">
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
                        <table className="table table-striped table-bordered mx-2 border-2 border-dark shadow-lg">
                            <thead>
                                <tr className='bg-success'>
                                    <th className="text-center">Id</th>
                                    <th className="text-center">Hoten</th>
                                    <th className="text-center">ngaySinh</th>
                                    <th className="text-center">diaChi</th>
                                    <th className="text-center w-1/4">trangThai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {diemDanh.map((nv) => (
                                    <tr key={nv.idCard}>
                                        <td>{nv.idCard}</td>
                                        <td>{nv.hoTen}</td>
                                        <td>{nv.ngaySinh}</td>
                                        <td>{nv.timeIn}</td>
                                        <td className='d-flex justify-content-center'>
                                            <button className="btn btn-primary">Edit <i className="bi bi-brush"></i></button>
                                            <button className="btn btn-danger ml-1">Delete <i className="bi bi-trash"></i></button>
                                        </td>
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