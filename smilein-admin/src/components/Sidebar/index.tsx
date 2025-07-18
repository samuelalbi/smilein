import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup';
import logo from '../../images/logo/SmileIn-Logo-White.png'

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  userType?: string | null;
}

interface MenuItem {
  path: string;
  name: string;
  icon: JSX.Element;
  allowedRoles: string[];
  subMenus?: { path: string; name: string; allowedRoles: string[] }[];
}

const Sidebar = ({ sidebarOpen, setSidebarOpen, userType = "admin" }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  // Define menu items with role-based permissions
  const menuItems: MenuItem[] = [
    {
      path: "/",
      name: "Dasbor",
      icon: (
        <svg
          className="fill-current"
          width="24"
          height="24"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.10322 0.956299H2.53135C1.5751 0.956299 0.787598 1.7438 0.787598 2.70005V6.27192C0.787598 7.22817 1.5751 8.01567 2.53135 8.01567H6.10322C7.05947 8.01567 7.84697 7.22817 7.84697 6.27192V2.72817C7.8751 1.7438 7.0876 0.956299 6.10322 0.956299ZM6.60947 6.30005C6.60947 6.5813 6.38447 6.8063 6.10322 6.8063H2.53135C2.2501 6.8063 2.0251 6.5813 2.0251 6.30005V2.72817C2.0251 2.44692 2.2501 2.22192 2.53135 2.22192H6.10322C6.38447 2.22192 6.60947 2.44692 6.60947 2.72817V6.30005Z"
            fill=""
          />
          <path
            d="M15.4689 0.956299H11.8971C10.9408 0.956299 10.1533 1.7438 10.1533 2.70005V6.27192C10.1533 7.22817 10.9408 8.01567 11.8971 8.01567H15.4689C16.4252 8.01567 17.2127 7.22817 17.2127 6.27192V2.72817C17.2127 1.7438 16.4252 0.956299 15.4689 0.956299ZM15.9752 6.30005C15.9752 6.5813 15.7502 6.8063 15.4689 6.8063H11.8971C11.6158 6.8063 11.3908 6.5813 11.3908 6.30005V2.72817C11.3908 2.44692 11.6158 2.22192 11.8971 2.22192H15.4689C15.7502 2.22192 15.9752 2.44692 15.9752 2.72817V6.30005Z"
            fill=""
          />
          <path
            d="M6.10322 9.92822H2.53135C1.5751 9.92822 0.787598 10.7157 0.787598 11.672V15.2438C0.787598 16.2001 1.5751 16.9876 2.53135 16.9876H6.10322C7.05947 16.9876 7.84697 16.2001 7.84697 15.2438V11.7001C7.8751 10.7157 7.0876 9.92822 6.10322 9.92822ZM6.60947 15.272C6.60947 15.5532 6.38447 15.7782 6.10322 15.7782H2.53135C2.2501 15.7782 2.0251 15.5532 2.0251 15.272V11.7001C2.0251 11.4188 2.2501 11.1938 2.53135 11.1938H6.10322C6.38447 11.1938 6.60947 11.4188 6.60947 11.7001V15.272Z"
            fill=""
          />
          <path
            d="M15.4689 9.92822H11.8971C10.9408 9.92822 10.1533 10.7157 10.1533 11.672V15.2438C10.1533 16.2001 10.9408 16.9876 11.8971 16.9876H15.4689C16.4252 16.9876 17.2127 16.2001 17.2127 15.2438V11.7001C17.2127 10.7157 16.4252 9.92822 15.4689 9.92822ZM15.9752 15.272C15.9752 15.5532 15.7502 15.7782 15.4689 15.7782H11.8971C11.6158 15.7782 11.3908 15.5532 11.3908 15.272V11.7001C11.3908 11.4188 11.6158 11.1938 11.8971 11.1938H15.4689C15.7502 11.1938 15.9752 11.4188 15.9752 11.7001V15.272Z"
            fill=""
          />
        </svg>
      ),
      allowedRoles: ["admin", "instructor"]
    },
    {
      path: "/student/student-list",
      name: "Mahasiswa",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      allowedRoles: ["admin"]
    },
    {
      path: "/instructor/instructor-list",
      name: "Instruktur",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 794.082 794.082" fill="white">
          <g>
            <path d="M713.298,186.754h0.003c0,90.051,0,179.204,0,269.796c-119.669,0.52-237.33,0.62-357.021,0.442c0-44.206,0-85.371,0-127.49c-17.63,0-33.229,0-52.015,0c0,44.361-1.585,86.458,0.541,128.362c1.495,29.475,29.195,51.681,59.068,51.744c114.688,0.25,229.375,0.143,344.062,0.619c34.097,0.146,60.201-24.021,60.039-60.542c-0.386-87.645-0.106-175.291-0.096-262.936h0.096v-45.693h-54.678L713.298,186.754L713.298,186.754z" />
            <path d="M775.44,72.811c-5.709-1.829-12.212-1.547-18.359-1.557c-57.313-0.103-114.627-0.062-171.938-0.062c-4.248,0-8.469,0-12.485,0c-1.768-18.784-17.569-33.482-36.814-33.482s-35.052,14.699-36.817,33.482c-4.446,0-9.112,0-13.8,0c-55.239,0-110.48-0.002-165.728,0.004c-4.833,0.001-9.71-0.352-14.491,0.173c-14.131,1.546-26.798,14.699-26.558,27.161c0.239,12.377,13.224,25.016,27.354,26.417c3.421,0.34,6.902,0.102,10.354,0.102c147.084,0.003,294.167,0.003,441.25,0.001c3.455,0,6.929,0.237,10.354-0.082c13.365-1.242,25.063-12.418,26.25-24.873C794.962,90.027,786.329,76.301,775.44,72.811z" />
            <path d="M358.014,201.16v-60.099h-54.678v60.099h2.078c17.43,0,33.452,0,50.521,0H358.014z" />
            <g>
              <circle cx="149.113" cy="113.355" r="89.043" />
              <path d="M439.494,215.397H211.476l-11.131,69.235l-10.105,62.865h-13.219l-8.515-96.739l9.972-35.357h-58.729l9.972,35.357l-8.515,96.739h-13.219L100,297.809l-10.042-62.466l-3.207-19.945H50h-0.125v0.003C22.317,215.468,0,237.825,0,265.398v212.99c0,27.612,22.386,50,50,50v187.548c0,27.614,22.386,50,50,50c24.416,0,44.731-17.505,49.112-40.646c4.382,23.142,24.699,40.646,49.115,40.646c27.614,0,50-22.386,50-50V503.403V414.59V315.4h191.269c27.613,0,50-22.387,50-50C489.494,237.783,467.109,215.397,439.494,215.397z" />
            </g>
            <path d="M683.544,718.137l0.038-0.039L563.957,598.473v-69.024h-56.055v64.062v4.963L388.278,718.098l0.038,0.039c-10.936,10.935-10.936,28.663,0,39.598c10.936,10.937,28.663,10.936,39.599,0l79.988-79.988v64.023c0,15.464,12.534,28,28,28c15.464,0,28-12.536,28-28h0.055v-64.023l79.988,79.988c10.936,10.936,28.663,10.937,39.599,0C694.479,746.8,694.479,729.072,683.544,718.137z" />
          </g>
        </svg>
      ),
      allowedRoles: ["admin"]
    },
    {
      path: "/course/course-list",
      name: "Mata Kuliah",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-notebook-pen">
          <path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4" />
          <path d="M2 6h4" />
          <path d="M2 10h4" />
          <path d="M2 14h4" />
          <path d="M2 18h4" />
          <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
        </svg>
      ),
      allowedRoles: ["admin"]
    },
    {
      path: "/room/room-list",
      name: "Room",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      allowedRoles: ["admin"]
    },
    {
      path: "/schedule/schedules",
      name: "Jadwal",
      icon: (
        <svg
          className="fill-white"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.7024 0.586486H18.1681V2.09086C18.1681 2.59172 17.7506 3.00086 17.2592 3.00086C16.7678 3.00086 16.3592 2.59172 16.3592 2.09086V0.586486H5.6408V2.09086C5.6408 2.59172 5.23223 3.00086 4.7408 3.00086C4.24937 3.00086 3.8408 2.59172 3.8408 2.09086V0.586486H2.2976C1.31509 0.586486 0.5 1.39371 0.5 2.38741V19.6135C0.5 20.6072 1.31509 21.4144 2.2976 21.4144H19.7024C20.6849 21.4144 21.5 20.6072 21.5 19.6135V2.38741C21.5 1.39371 20.6849 0.586486 19.7024 0.586486ZM19.7024 19.6135H2.2976V6.30971H19.7024V19.6135Z"
            fill=""
          />
          <path
            d="M6.5 11H5.1C4.8 11 4.5 10.7 4.5 10.4V9.6C4.5 9.3 4.8 9 5.1 9H6.5C6.8 9 7.1 9.3 7.1 9.6V10.4C7.1 10.7 6.8 11 6.5 11Z"
            fill=""
          />
          <path
            d="M11.9 11H10.5C10.2 11 9.90002 10.7 9.90002 10.4V9.6C9.90002 9.3 10.2 9 10.5 9H11.9C12.2 9 12.5 9.3 12.5 9.6V10.4C12.5 10.7 12.2 11 11.9 11Z"
            fill=""
          />
          <path
            d="M17.3 11H15.9C15.6 11 15.3 10.7 15.3 10.4V9.6C15.3 9.3 15.6 9 15.9 9H17.3C17.6 9 17.9 9.3 17.9 9.6V10.4C17.9 10.7 17.6 11 17.3 11Z"
            fill=""
          />
          <path
            d="M6.5 16H5.1C4.8 16 4.5 15.7 4.5 15.4V14.6C4.5 14.3 4.8 14 5.1 14H6.5C6.8 14 7.1 14.3 7.1 14.6V15.4C7.1 15.7 6.8 16 6.5 16Z"
            fill=""
          />
          <path
            d="M11.9 16H10.5C10.2 16 9.90002 15.7 9.90002 15.4V14.6C9.90002 14.3 10.2 14 10.5 14H11.9C12.2 14 12.5 14.3 12.5 14.6V15.4C12.5 15.7 12.2 16 11.9 16Z"
            fill=""
          />
          <path
            d="M17.3 16H15.9C15.6 16 15.3 15.7 15.3 15.4V14.6C15.3 14.3 15.6 14 15.9 14H17.3C17.6 14 17.9 14.3 17.9 14.6V15.4C17.9 15.7 17.6 16 17.3 16Z"
            fill=""
          />
        </svg>
      ),
      allowedRoles: ["admin"]
    },

    {
      path: "/attendance/attendance-list",
      name: "Attendance",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-check">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <polyline points="16 11 18 13 22 9" />
        </svg>
      ),
      allowedRoles: ["admin", "instructor"]
    },
  ];

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  // Helper function to check if a menu item is active
  const isActive = (path: string) => {
    // For the dashboard route, we need an exact match
    if (path === "/") {
      return pathname === path;
    }
    // For other routes, we check if the pathname starts with the path
    return pathname.startsWith(path);
  };

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <Link to="/" className="block">
          <div className="flex items-center justify-between px-5 gap-6">
            <img src={logo} alt="sendir-logo" className='w-60' />
          </div>
        </Link>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="py-4 px-4 lg:px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              MENU
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {/* Filter menu items based on user role */}
              {menuItems.filter(item => item.allowedRoles.includes(userType || "")).map((item, index) => {
                if (item.subMenus) {
                  // Handle submenu items
                  return (
                    <SidebarLinkGroup
                      key={index}
                      activeCondition={isActive(item.path)}
                    >
                      {(handleClick, open) => {
                        return (
                          <React.Fragment>
                            <NavLink
                              to="#"
                              className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${isActive(item.path) && 'bg-graydark dark:bg-meta-4'}`}
                              onClick={(e) => {
                                e.preventDefault();
                                sidebarExpanded
                                  ? handleClick()
                                  : setSidebarExpanded(true);
                              }}
                            >
                              {item.icon}
                              {item.name}
                              <svg
                                className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-180'}`}
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                                  fill=""
                                />
                              </svg>
                            </NavLink>
                            {/* Dropdown Menu */}
                            <div className={`translate transform overflow-hidden ${!open && 'hidden'}`}>
                              <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                                {item.subMenus
                                  .filter(subMenu => subMenu.allowedRoles.includes(userType || ""))
                                  .map((subMenu, subIndex) => (
                                    <li key={subIndex}>
                                      <NavLink
                                        to={subMenu.path}
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                          (isActive && '!text-white')
                                        }
                                      >
                                        {subMenu.name}
                                      </NavLink>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          </React.Fragment>
                        );
                      }}
                    </SidebarLinkGroup>
                  );
                } else {
                  // Handle regular menu items
                  return (
                    <li key={index}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${(item.path === "/" ? pathname === "/" : pathname.startsWith(item.path)) && 'bg-graydark dark:bg-meta-4'
                          }`
                        }
                      >
                        {item.icon}
                        {item.name}
                      </NavLink>
                    </li>
                  );
                }
              })}
            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default Sidebar;