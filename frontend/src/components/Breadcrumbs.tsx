import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Dashboard
    breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' });

    // Map path segments to breadcrumb items
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];

      switch (segment) {
        case 'dashboard':
          // Skip dashboard as it's already added
          break;
        case 'devices':
          breadcrumbs.push({ label: 'Devices', path: '/devices' });
          break;
        case 'reports':
          breadcrumbs.push({ label: 'Reports', path: '/reports' });
          break;
        case 'activities':
          breadcrumbs.push({ label: 'Activities', path: '/activities' });
          break;
        case 'settings':
          breadcrumbs.push({ label: 'Settings', path: '/settings' });
          break;
        case 'admin':
          breadcrumbs.push({ label: 'Administration', path: '/admin' });
          break;
        default:
          // For device IDs or other dynamic segments
          if (pathSegments[i - 1] === 'devices' && /^\d+$/.test(segment)) {
            breadcrumbs.push({ label: `Device ${segment}` });
          } else {
            breadcrumbs.push({ label: segment.charAt(0).toUpperCase() + segment.slice(1) });
          }
          break;
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't show breadcrumbs for dashboard only
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <MuiBreadcrumbs
      separator={<NavigateNext fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      {breadcrumbs.map((breadcrumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        if (isLast || !breadcrumb.path) {
          return (
            <Typography key={index} color="text.primary">
              {breadcrumb.label}
            </Typography>
          );
        }

        return (
          <Link
            key={index}
            color="inherit"
            href={breadcrumb.path}
            onClick={(e) => {
              e.preventDefault();
              navigate(breadcrumb.path!);
            }}
            sx={{ cursor: 'pointer' }}
          >
            {breadcrumb.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;
