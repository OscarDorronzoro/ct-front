import { useState } from 'react';
import {
  SatelliteDish,
  Users,
  LandPlot,
  UserRound,
  Menu
} from 'lucide-react';
import CowIcon from './icons/CowIcon';
import NavItem from './NavItem';

import useAuth from '../context/auth/useAuth';

export default function SettingsDrawer() {
  const [collapsed, setCollapsed] = useState(true);
  const { user } = useAuth();

  return (
    <>
      {!collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 2000,
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 'calc(60px + env(safe-area-inset-bottom))',
        //height: '100%',
        width: collapsed ? '2px' : '120px',

        zIndex: 2001,
        boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
        background: '#3a4744',

        display: 'flex',
        flexDirection: 'column',
      }}>

        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            color: 'black',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '20px',
          }}
        >
          <Menu size={21} strokeWidth={2}/>
        </button>

        {!collapsed &&(
          <>
            <NavItem to="/settings/cows">
              <CowIcon size={21} strokeWidth={2} />
              {!collapsed && 'Vacas'}
            </NavItem>
            <NavItem to="/settings/collars">
              <SatelliteDish size={21} strokeWidth={2} />
              {!collapsed && 'Collares'}
            </NavItem>
            <NavItem to="/settings/groups">
              <Users size={21} strokeWidth={2} />
              {!collapsed && 'Grupos'}
            </NavItem>
            <NavItem to="/settings/zones">
              <LandPlot size={21} strokeWidth={2} />
              {!collapsed && 'Zonas'}
            </NavItem>
            {user?.role === 0 && (
              <NavItem to="/settings/users">
                <UserRound size={21} strokeWidth={2} />
                {!collapsed && 'Usuarios'}
              </NavItem>
            )}
          </>
        )}
      </div>
    </>
  );
}
