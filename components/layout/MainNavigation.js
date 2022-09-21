import classes from './MainNavigation.module.css';
import Link from 'next/link';
function MainNavigation() {

  return (
    <header className={classes.header}>
      <div className={classes.logo}>Food Manager</div>
      <nav>
        <ul>
          <li>
            <Link href='/'>All Recipes</Link>
          </li>
          <li>
            <Link href='/new-meetup'>Add New Recipe</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default MainNavigation;
