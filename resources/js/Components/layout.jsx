import React from 'react'
import { Navbar } from 'react-bootstrap'
import { ToastContainer } from 'react-toastify'

export const Layout=({children, withFooter=true})=>{
    return (
        <div className='d-flex flex-column' style={{minHeight:"100vh"}}>
            <Navbar expand="lg" style={{left:0, top:0, width:"100%", zIndex:999, height:"auto"}}>
                <div className="container d-flex">
                    <Navbar.Toggle aria-controls="nav-collapse" />
                    <a href="#" className="navbar-brand me-auto ms-3 ms-lg-0">
                        <span className="text-primary">EWS</span>
                    </a>
                    <a href="/login" className="btn btn-primary rounded-pill order-lg-1">
                        Login Admin
                    </a>
                    <Navbar.Collapse id="nav-collapse">
                        <ul class="navbar-nav mx-auto mt-2 mt-lg-0">
                            <li class="nav-item">
                                <a class="nav-link link-dark fs-15px fw-medium" href="/">Dashboard</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link link-dark fs-15px fw-medium" href="/peringatan_dini">Peringatan Dini</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link link-dark fs-15px fw-medium" href="">Opt Utama</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link link-dark fs-15px fw-medium" href="/jadwal_tanam">Jadwal Tanam</a>
                            </li>
                        </ul>
                    </Navbar.Collapse>
                </div>
            </Navbar>

            {children}

            {withFooter&&
                <div id="footer" className='mt-auto'>
                    <div class="container">
                        <footer class="pt-5">
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <h4 className='text-primary fs-3 fw-bold'>EWS</h4>
                                    <p className='mt-3 text-secondary'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <h4 className='fw-semibold'>Section</h4>
                                    <ul class="nav flex-column mt-3">
                                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-secondary">Home</a></li>
                                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-secondary">Features</a></li>
                                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-secondary">Pricing</a></li>
                                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-secondary">FAQs</a></li>
                                        <li class="nav-item mb-2"><a href="#" class="nav-link p-0 text-secondary">About</a></li>
                                    </ul>
                                </div>
                                <div className='col-md-5 mb-3'>
                                    <h4 className='fw-semibold'>Link Partner</h4>
                                    <div className='d-flex flex-wrap mt-3'>
                                        <div className='me-2 mb-2'>
                                            <svg class="bd-placeholder-img" width="75" height="75" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 140x140" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#eee"/></svg>
                                        </div>
                                        <div className='me-2 mb-2'>
                                            <svg class="bd-placeholder-img" width="150" height="75" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 140x140" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#eee"/></svg>
                                        </div>
                                        <div className='me-2 mb-2'>
                                            <svg class="bd-placeholder-img" width="100" height="75" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 140x140" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#eee"/></svg>
                                        </div>
                                        <div className='me-2 mb-2'>
                                            <svg class="bd-placeholder-img" width="120" height="75" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 140x140" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#eee"/></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="d-flex flex-column flex-sm-row justify-content-between py-3 border-top">
                                <p>&copy; 2022 Company, Inc. All rights reserved.</p>
                                <ul class="list-unstyled d-flex">
                                    <li class="ms-3"><a class="link-dark" href="#"></a></li>
                                    <li class="ms-3"><a class="link-dark" href="#"></a></li>
                                    <li class="ms-3"><a class="link-dark" href="#"></a></li>
                                </ul>
                            </div>
                        </footer>
                    </div>
                </div>
            }

            <ToastContainer
                position="top-center"
                autoClose={200000}
                hideProgressBar
                newestOnTop={false}
                closeButton={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover
                theme="colored"
                limit={1}
            />
        </div>
    )
}
