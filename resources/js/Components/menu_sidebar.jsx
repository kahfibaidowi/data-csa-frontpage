import { BASE_URL } from '@/Config/config'
import classNames from 'classnames'
import React from 'react'
import { Collapse, Offcanvas } from 'react-bootstrap'
import { FiBarChart2, FiChevronDown, FiChevronUp, FiCloudRain, FiCloudSnow, FiHome, FiWind } from 'react-icons/fi'

const MenuSidebar=(props)=>{
    return (
        <Offcanvas show={props.show_menu} placement="start" onHide={()=>props.setShowMenu(false)}>
            <Offcanvas.Header>
                <Offcanvas.Title>
                    <a href="/" className="navbar-brand me-auto ms-3 ms-lg-0">
                        {props.pengaturan.logo!=""?
                            <img src={BASE_URL+"/storage/"+props.pengaturan.logo} style={{maxHeight:"20px"}}/>
                        :
                            <span className="text-success">{props.pengaturan.title}</span>
                        }
                    </a>
                </Offcanvas.Title>
                <button 
                    type="button" 
                    class="btn-close" 
                    aria-label="Close" 
                    style={{fontSize:"20px"}}
                    onClick={()=>props.setShowMenu(false)}
                ></button>
            </Offcanvas.Header>
            <Offcanvas.Body className="sidebar">
                <div className="sidebar-body">
                    <ul class="nav p-2">
                        {/* <li class="nav-item nav-category">Main</li> */}
                        <li class="nav-item">
                            <a href="/" class="nav-link">
                                <FiHome className="link-icon"/>
                                <span class="link-title">Dashboard</span>
                            </a>
                        </li>
                        <li 
                            className={classNames(
                                "nav-item",
                                {"active":props.collapse=="sebaran_opt"}
                            )}
                        >
                            <a 
                                className="nav-link cursor-pointer" 
                                onClick={e=>props.setCollapse(props.collapse=="sebaran_opt"?"":"sebaran_opt")} 
                                aria-expanded={props.collapse=="sebaran_opt"}
                            >
                                <FiCloudSnow className="link-icon"/>
                                <span className="link-title">Sebaran OPT</span>
                                <FiChevronDown className="link-arrow"/>
                            </a>
                            <Collapse in={props.collapse=="sebaran_opt"}>
                                <div>
                                    <ul className="nav sub-menu">
                                        <li className="nav-item">
                                            <a href="/sebaran_opt" className={classNames("nav-link")}>
                                                Data Sebaran
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="/sebaran_opt/peta" className={classNames("nav-link")}>
                                                Peta Sebaran
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </Collapse>
                        </li>
                        <li class="nav-item">
                            <a href="/info_grafis" class="nav-link">
                                <FiBarChart2 className="link-icon"/>
                                <span class="link-title">Infografis</span>
                            </a>
                        </li>
                        <li 
                            className={classNames(
                                "nav-item",
                                {"active":props.collapse=="peringatan_dini"}
                            )}
                        >
                            <a 
                                className="nav-link cursor-pointer" 
                                onClick={e=>props.setCollapse(props.collapse=="peringatan_dini"?"":"peringatan_dini")} 
                                aria-expanded={props.collapse=="peringatan_dini"}
                            >
                                <FiCloudRain className="link-icon"/>
                                <span className="link-title">Peringatan Dini</span>
                                <FiChevronDown className="link-arrow"/>
                            </a>
                            <Collapse in={props.collapse=="peringatan_dini"}>
                                <div>
                                    <ul className="nav sub-menu">
                                        <li className="nav-item">
                                            <a href="/peringatan_dini/banjir" className={classNames("nav-link")}>
                                                Banjir
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="/peringatan_dini/kekeringan" className={classNames("nav-link")}>
                                                Kekeringan
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="#" className={classNames("nav-link")}>
                                                Sebaran OPT
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </Collapse>
                        </li>
                        <li 
                            className={classNames(
                                "nav-item",
                                {"active":props.collapse=="jadwal_tanam"}
                            )}
                        >
                            <a 
                                className="nav-link cursor-pointer" 
                                onClick={e=>props.setCollapse(props.collapse=="jadwal_tanam"?"":"jadwal_tanam")} 
                                aria-expanded={props.collapse=="jadwal_tanam"}
                            >
                                <FiWind className="link-icon"/>
                                <span className="link-title">Jadwal Tanam</span>
                                <FiChevronDown className="link-arrow"/>
                            </a>
                            <Collapse in={props.collapse=="jadwal_tanam"}>
                                <div>
                                    <ul className="nav sub-menu">
                                        <li className="nav-item">
                                            <a href="/jadwal_tanam" className={classNames("nav-link")}>
                                                Jadwal Tanam Tabular
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="/jadwal_tanam/cabai_besar" className={classNames("nav-link")}>
                                                Peta Cabai Besar
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="/jadwal_tanam/cabai_rawit" className={classNames("nav-link")}>
                                                Peta Cabai Rawit
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="/jadwal_tanam/bawang_merah" className={classNames("nav-link")}>
                                                Peta Bawang Merah
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </Collapse>
                        </li>
                    </ul>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    )
}

export default MenuSidebar