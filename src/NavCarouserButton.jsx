// NavCarouserButton — the "Carouser Club" slot in the main nav.
//
// Before launch: a non-clickable countdown pill (digits only).
//                On hover: a tooltip explains what it's counting down to.
// After launch:  a normal styled link to /carouser-club.
//
// Used in both the desktop nav and the mobile drawer.

import { Link } from 'react-router-dom';
import { useTimeLeft, pad } from './carouserLaunch';

export default function NavCarouserButton({ onClick, className = 'nav-cta' }) {
  const timeLeft = useTimeLeft();

  if (!timeLeft) {
    return (
      <Link to="/carouser-club" className={className} onClick={onClick}>
        Carouser Club
      </Link>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <span
      className={`${className} nav-cta--countdown`}
      role="text"
      aria-label={`Carouser Club membership opens May 11 — ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds from now`}
    >
      <span className="nav-cta-countdown-digits">
        {days}d&nbsp;{pad(hours)}h&nbsp;{pad(minutes)}m&nbsp;{pad(seconds)}s
      </span>
      <span className="nav-cta-tooltip" role="tooltip">
        <strong>Carouser Club</strong> memberships open<br />
        Sunday, May 11
      </span>
    </span>
  );
}
