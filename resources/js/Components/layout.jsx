import { BASE_URL } from '@/Config/config'
import { Head } from '@inertiajs/react'
import React from 'react'
import { Dropdown, Navbar, NavDropdown } from 'react-bootstrap'
import { FiChevronDown } from 'react-icons/fi'
import { ToastContainer } from 'react-toastify'

export const Layout=({children, withFooter=true, pengaturan, footer})=>{
    return (
        <>
            <div className='d-flex flex-column' style={{minHeight:"100vh"}}>
                <Navbar expand="lg" style={{left:0, top:0, width:"100%", zIndex:999, height:"auto"}}>
                    <div className="container d-flex">
                        <Navbar.Toggle aria-controls="nav-collapse" />
                        <a href="/" className="navbar-brand me-auto ms-3 ms-lg-0">
                            {pengaturan.logo!=""?
                                <img src={BASE_URL+"/storage/"+pengaturan.logo} style={{maxHeight:"35px"}}/>
                            :
                                <span className="text-success">{pengaturan.title}</span>
                            }
                            
                        </a>
                        <a href={"https://dashboard.ews.tifpsdku.com/login"} className="btn btn-success rounded-pill order-lg-1">
                            Login Admin
                        </a>
                        <Navbar.Collapse id="nav-collapse">
                            <ul class="navbar-nav mx-auto mt-2 mt-lg-0">
                                <li class="nav-item">
                                    <a class="nav-link link-dark fs-15px fw-medium" href="/">Dashboard</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link link-dark fs-15px fw-medium" href="/info_grafis">Infografis</a>
                                </li>
                                <Dropdown>
                                    <Dropdown.Toggle className='nav-link link-dark fs-15px fw-medium' as="a" href="#">
                                        Peringatan Dini
                                        <FiChevronDown className='ms-1'/>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <NavDropdown.Item className='fs-14px' href="/peringatan_dini/banjir">Banjir</NavDropdown.Item>
                                        <NavDropdown.Item className='fs-14px' href="/peringatan_dini/kekeringan">Kekeringan</NavDropdown.Item>
                                        <NavDropdown.Item className='fs-14px' href="#">Sebaran OPT</NavDropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                                {/* <li class="nav-item">
                                    <a class="nav-link link-dark fs-15px fw-medium" href="">Opt Utama</a>
                                </li> */}
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
                                        {footer.about.show_title&&<h4 className='fw-semibold mb-3'>{footer.about.title}</h4>}
                                        {pengaturan.logo!=""?
                                            <img src={BASE_URL+"/storage/"+pengaturan.logo} style={{maxHeight:"35px"}}/>
                                        :
                                            <span className="text-success fw-semibold fs-3">{pengaturan.title}</span>
                                        }
                                        <p className='mt-3 text-secondary'>{footer.about.content}</p>
                                    </div>
                                    {footer.menu.data.length>0&&
                                        <div class="col-md-3 mb-3">
                                            <h4 className='fw-semibold mb-3'>{footer.menu.title}</h4>
                                            <ul class="nav flex-column">
                                                {footer.menu.data.map(md=>(
                                                    <li class="nav-item mb-2"><a href={md.link_to} class="nav-link p-0 text-secondary">{md.text}</a></li>
                                                ))}
                                            </ul>
                                        </div>
                                    }
                                    {footer.partner.data.length>0&&
                                        <div className='col-md-5 mb-3'>
                                            <h4 className='fw-semibold mb-3'>{footer.partner.title}</h4>
                                            <div className='d-flex flex-wrap'>
                                                {footer.partner.data.map(pd=>(
                                                    <a href={pd.link_to} className='me-2 mb-2'>
                                                        <img
                                                            src={BASE_URL+"/storage/"+pd.gambar}
                                                            class="bd-placeholder-img"
                                                            style={{
                                                                height:"75px"
                                                            }}
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    }
                                </div>

                                <div class="d-flex flex-column flex-sm-row justify-content-between py-3 border-top">
                                    <p>&copy; 2023 {pengaturan.company}. All rights reserved.</p>
                                </div>
                            </footer>
                        </div>
                    </div>
                }

                <ToastContainer
                    position="top-center"
                    autoClose={2000}
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
        </>
    )
}
